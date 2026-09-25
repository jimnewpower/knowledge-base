# Docker and containers cheat sheet

> Baseline: Linux containers, Docker BuildKit and Compose v2; Java 21 and PostgreSQL 16 examples. Reviewed: 2026-09-24.

A **container** is an isolated process with its own filesystem view, built from an **image**. Docker is the common builder and runtime; Kubernetes / OpenShift schedule the same kind of image. This sheet covers the image and the local runtime.

## Mental model

```text
Dockerfile  --build-->  image  --run-->  container
                              --push-->  registry
```

- Image: immutable layers addressed by digest.
- Tag (`app:1.4.0`): movable pointer. Prefer digest in production.
- Container: a writable layer on top of the image plus namespaces and cgroups.

## Everyday commands

```bash
docker build -t order-api:1.4.0 .
docker run --rm -p 8080:8080 --env-file .env order-api:1.4.0
docker ps
docker logs -f container
docker exec -it container sh  # if the image includes a shell
docker stop container
docker image ls
docker rmi order-api:1.4.0
```

`docker compose up --build` for multi-process local stacks.

## Runtime Dockerfile

Assumes CI[^ci] produced an executable `target/order-service.jar` (for example with Spring Boot repackage and Maven `finalName` set to `order-service`). An ordinary Maven JAR[^jar] may need external dependencies and a main-class manifest.

```dockerfile
# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --chown=app:app target/order-service.jar app.jar

USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Multi-stage alternative; keep `mvnw` LF[^lf]-terminated in Git. This example runs the Maven verification lifecycle:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
COPY . .
RUN chmod +x mvnw && ./mvnw -q verify

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build --chown=app:app /src/target/order-service.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Better in many Java shops: **build the jar on CI, copy only the jar into a JRE[^jre] image.** The Dockerfile stays small and Maven stays the compiler of record.

## Layers and cache

For a single-module project, replace the build stage with this fragment. Copy the wrapper and its configuration before invoking it; multi-module builds also need their module POMs[^pom]:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
COPY mvnw .
COPY .mvn/ .mvn/
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY src ./src
RUN ./mvnw -q verify
```

A source change can reuse downloaded dependencies. `dependency:go-offline` is a cache optimization, not proof that every build plugin can run offline. Projects using Testcontainers need a suitable container runtime in their build environment.

## Compose sketch

Local development example using the runtime Dockerfile and an already-built JAR. The credentials below are for this disposable local database only:

```yaml
services:
  api:
    build: .
    ports: ["127.0.0.1:8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/orders
      SPRING_DATASOURCE_USERNAME: orders
      SPRING_DATASOURCE_PASSWORD: local
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: orders
      POSTGRES_PASSWORD: local
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orders -d orders"]
      interval: 5s
      timeout: 3s
      retries: 10
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

Database initialization variables apply only to an empty data directory. Short-form `depends_on: [db]` orders startup but does not wait for readiness. Applications still need to handle later connection failures.

Compose can run production services on one host; multi-host scheduling and failover need an orchestrator or other operational tooling.

## Runtime knobs

| Concern | Knob |
|---------|------|
| Memory | `docker run -m 512m` and JVM[^jvm] `-XX:MaxRAMPercentage=75` |
| CPU[^cpu] | `--cpus` |
| Config | env vars or mounted files; not baked secrets |
| Data | named volumes or mounts; containers are disposable |
| Health | `HEALTHCHECK` or orchestrator probes against `/actuator/health` |
| Logs | stdout/stderr only; let the platform collect them |

## Registries and promotion

```bash
docker tag order-api:1.4.0 registry.example.com/order-api:1.4.0
docker push registry.example.com/order-api:1.4.0
```

Promote by digest across environments. Retagging `:latest` is not a release process.

## Security baseline

- Non-root `USER`.
- Minimal base (JRE, distroless, alpine/ubi-minimal) — know the glibc vs musl tradeoff.
- No secrets in layers (`ENV PASSWORD=` is still in history).
- Scan the image in CI.
- Pin base images by digest when the environment requires reproducibility.

## Gotchas

- `COPY . .` with no `.dockerignore` ships `.git` and `target/`.
- Binding `8080:8080` on a laptop is not service discovery.
- PID[^pid] 1 and signals: use an exec-form `ENTRYPOINT` so `stop` reaches the JVM.
- Host networking hides port bugs that will appear in a cluster.
- “Works in Docker” with a volume-mounted source tree is not the same as the image CI ships.

## References

- [Docker — Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker — Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
- [PostgreSQL official image — initialization variables](https://hub.docker.com/_/postgres)

[^ci]: Continuous Integration.
[^jar]: Java Archive.
[^lf]: Line Feed — the newline character used by Unix-style text files.
[^jre]: Java Runtime Environment.
[^pom]: Project Object Model — Maven's project configuration.
[^jvm]: Java Virtual Machine.
[^cpu]: Central Processing Unit.
[^pid]: Process Identifier.

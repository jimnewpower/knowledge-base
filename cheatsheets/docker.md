# Docker and containers cheat sheet

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
docker exec -it container bash
docker stop container
docker image ls
docker rmi order-api:1.4.0
```

`docker compose up --build` for multi-process local stacks.

## Dockerfile that will not embarrass you

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

Multi-stage when you compile in Docker:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
COPY . .
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
COPY --from=build /src/target/order-service.jar /app/app.jar
# ...
```

Better in many Java shops: **build the jar on CI, copy only the jar into a JRE image.** The Dockerfile stays small and Maven stays the compiler of record.

## Layers and cache

Order instructions from least-changing to most-changing:

```dockerfile
COPY pom.xml .
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY src ./src
RUN ./mvnw -q -DskipTests package
```

A one-line source change should not re-download the internet.

## Compose sketch

```yaml
services:
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/orders
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: local
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

Compose is a development and demo tool. It is not an orchestrator for production.

## Runtime knobs

| Concern | Knob |
|---------|------|
| Memory | `docker run -m 512m` and JVM `-XX:MaxRAMPercentage=75` |
| CPU | `--cpus` |
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
- PID 1 and signals: use an exec-form `ENTRYPOINT` so `stop` reaches the JVM.
- Host networking hides port bugs that will appear in a cluster.
- “Works in Docker” with a volume-mounted source tree is not the same as the image CI ships.

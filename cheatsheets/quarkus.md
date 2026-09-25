# Quarkus cheat sheet

> Baseline: Quarkus 3.x, Jakarta APIs[^api], Java 21, Maven; select an exact supported platform release for the project. Reviewed: 2026-09-25.

Quarkus performs substantial work at build time. Treat the platform BOM[^bom], extensions, build configuration, and packaging mode as a coordinated choice.

Related: [Spring Boot](spring-boot.md), [Maven](maven.md), [JDBC and HikariCP](jdbc-hikaricp.md)[^jdbc][^hikaricp], [testing](testing.md).

## Project commands

Run in a generated Quarkus Maven project with its wrapper and platform plugin configured. Bash commands; Windows uses `mvnw.cmd`.

```bash
./mvnw quarkus:dev
./mvnw verify
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar
```

The final command assumes default fast-JAR[^jar] packaging. Deploy the entire `quarkus-app` directory, not just `quarkus-run.jar`. Dev mode is for local development; Dev Services can provision infrastructure when the necessary container runtime is available.

## Framework boundaries

| Concern | Quarkus choice | Check |
|---------|----------------|-------|
| DI[^di] | ArC/CDI[^cdi], `@ApplicationScoped`, constructor injection | Bean discovery and build-time removal of unused beans |
| REST[^rest] | Jakarta REST with Quarkus REST extensions | Match extensions to the platform BOM; do not mix REST stacks casually |
| Configuration | `application.properties`, environment overrides, config mappings | Some properties are fixed at build time |
| JDBC | Agroal pool with relevant datasource extension | HikariCP settings from Spring do not configure Agroal |
| Transactions | Jakarta `@Transactional` on service use cases | Database work must use the intended datasource/transaction |
| Tests | `@QuarkusTest`; packaged-app tests with `@QuarkusIntegrationTest` | Bind/run the integration-test lifecycle and test the built artifact |

## Configuration fragment

Merge into `src/main/resources/application.properties` in a project with the PostgreSQL JDBC extension. The production environment must supply the named values; development credentials are not release defaults.

```properties
quarkus.datasource.db-kind=postgresql
%prod.quarkus.datasource.jdbc.url=${APP_JDBC_URL}
%prod.quarkus.datasource.username=${APP_DB_USER}
%prod.quarkus.datasource.password=${APP_DB_PASSWORD}
```

Validate required runtime configuration at startup. Review the selected extension's configuration reference before assuming an environment override can change a build-time property.

## Native and reactive decisions

A native executable can reduce startup time and memory in some workloads, but increases build/toolchain constraints. Test reflection, resource loading, serialization, TLS[^tls], and native dependencies in the actual executable. Measure a representative JVM[^jvm] baseline first.

Do not run blocking JDBC, file I/O[^i-o], or long model calculations on an event-loop thread. Quarkus REST dispatch depends on method signature and annotations; choose a documented blocking/worker or virtual-thread path for the selected release. A reactive return type alone cannot make a blocking library nonblocking.

## References

- [Quarkus first application and packaging](https://quarkus.io/guides/getting-started/)
- [Quarkus configuration reference](https://quarkus.io/guides/config-reference/)
- [Quarkus datasource configuration](https://quarkus.io/guides/datasource)
- [Quarkus REST execution model](https://quarkus.io/guides/rest#execution-model-blocking-non-blocking)

[^api]: Application Programming Interface — the contract through which software components interact.
[^bom]: Bill of Materials — a dependency-version catalog in Maven.
[^jdbc]: Java Database Connectivity.
[^hikaricp]: Hikari Connection Pool — a Java database connection pool.
[^jar]: Java Archive.
[^di]: Dependency Injection.
[^cdi]: Contexts and Dependency Injection.
[^rest]: Representational State Transfer.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^jvm]: Java Virtual Machine.
[^i-o]: Input/Output.

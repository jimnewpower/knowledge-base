# Cheat sheets

Quick-reference notes for software engineering and architecture. These are not ADRs and not domain surveys. Use them at the keyboard; put design rationale in `architecture/` and `decisions/`.

Each sheet names its baseline, review date, and primary references. A review date records an editorial/technical review, not a claim that every command was executed or every linked document is frozen at that date. Deployment versions take precedence over examples.

Examples are fragments unless explicitly described as complete. Java imports and surrounding application types are generally omitted; `...`, named domain types, and placeholder paths require project-specific code. A labelled sketch teaches structure and is not a runnable application. Keep prerequisites beside examples intended for copying.

When editing a sheet, compile applicable Java fragments in a small harness, parse complete JSON/YAML/XML examples, check Markdown rendering and local links, and run behavior checks for claims that depend on ordering, failure, or framework configuration. Keep temporary validation harnesses outside the deliverables.

| Sheet | Use when |
|-------|----------|
| [Git](git.md) | Branching, history, undo, collaboration |
| [Bash](bash.md) | Shell, pipelines, scripting on Linux |
| [Java](java.md) | Language, types, concurrency, modern Java |
| [REST APIs](rest-apis.md) | HTTP APIs, resources, errors, versioning |
| [Authentication](authentication.md) | Proving identity |
| [Authorization](authorization.md) | Deciding what an identity may do |
| [Maven](maven.md) | Build, dependencies, multi-module Java |
| [AI prompt and context engineering](ai-prompt-and-context-engineering.md) | Prompts, context windows, agent working memory |
| [Clean code and SOLID](clean-code-and-solid.md) | Readability and design principles |
| [Object-oriented design](ood.md) | Objects, responsibilities, composition |
| [UML](uml.md) | Diagrams that earn their keep |
| [C4 architecture diagrams](c4-diagrams.md) | Context, container, component, dynamic, and deployment views |
| [Structurizr DSL](structurizr-dsl.md) | Model architecture as code, validate workspaces, and export views |
| [Software architecture styles](architecture-styles.md) | Compare layers, modules, services, events, workers, and plugins |
| [Domain-driven design](domain-driven-design.md) | Bounded contexts, context maps, aggregates, and domain language |
| [Architecture decision records](architecture-decisions.md) | Capture constraints, alternatives, consequences, and revisit triggers |
| [Quality attributes and architecture review](quality-attributes.md) | Measurable scenarios, tradeoffs, and architecture fitness checks |
| [Architecture documentation with arc42](architecture-documentation.md) | Organize architecture views, decisions, risks, and authoritative sources |
| [Docker and containers](docker.md) | Images, containers, Compose |
| [Data structures](data-structures.md) | When to use which structure |
| [Algorithms](algorithms.md) | Complexity and core algorithms |
| [DevOps](devops.md) | Delivery loop, gates, operability |
| [Distributed systems](distributed-systems.md) | Failure, consistency, coordination |
| [Markdown](markdown.md) | Notation used in this repository |
| [Regular expressions](regex.md) | Pattern matching |
| [TDD](tdd.md) | Test-first design loop |
| [SQL and relational modeling](sql.md) | Tables, joins, indexes, migrations |
| [Spring Boot](spring-boot.md) | Wiring, config, web, actuator |
| [HTTP and TLS](http-and-tls.md) | Messages, headers, certificates |
| [Transactions and isolation](transactions-and-isolation.md) | ACID, levels, outbox |
| [Kubernetes and OpenShift](kubernetes-openshift.md) | Pods, probes, routes, rollouts |
| [Testing beyond the unit](testing.md) | Slices, Testcontainers, contracts |
| [Observability](observability.md) | Logs, metrics, traces, health |
| [Java concurrency](java-concurrency.md) | Happens-before, pools, virtual threads |
| [Resilience and integration failure](resilience.md) | Timeouts, retries, idempotency |
| [Design patterns](design-patterns.md) | GoF and enterprise names |
| [OpenAPI and JSON Schema](openapi-and-json-schema.md) | HTTP and JSON contracts |
| [Application security](application-security.md) | Builder-facing OWASP |
| [JVM performance and GC](jvm-performance.md) | Heap, allocation, pauses |
| [Linux diagnostics](linux-diagnostics.md) | Process, disk, network, signals |
| [Messaging and events](messaging-and-events.md) | Brokers, outbox, consumers |
| [Enterprise Integration Patterns](enterprise-integration-patterns.md) | Integration styles, channels, endpoints, pattern selection |
| [Integration routing and coordination](integration-routing-and-coordination.md) | Routers, splitters, aggregators, workflow coordination |
| [Integration transformation](integration-transformation.md) | Translators, enrichment, canonical models, Claim Check |
| [Enterprise Service Bus](enterprise-service-bus.md) | Shared integration runtimes, legacy mediation, modernization |
| [API Gateway](api-gateway.md) | API routing, access policies, aggregation, BFFs |
| [JPA and Hibernate](jpa-and-hibernate.md) | Entity lifecycle, relationships, fetching, batching, optimistic locking |
| [Java and Jakarta modernization](java-jakarta-modernization.md) | Compatibility matrices, namespace changes, staged upgrades |
| [Modular monoliths and architectural boundaries](modular-monoliths.md) | Module APIs, ports/adapters, data ownership, extraction decisions |
| [Database migrations and backfills](database-migrations.md) | Expand/contract, checkpoints, concurrent writes, recovery |
| [Jackson and JSON serialization](jackson-json.md) | DTOs, mapper policy, precision, streaming, Jackson 2/3 boundaries |
| [Caching and invalidation](caching.md) | Cache policies, expiration, refresh, invalidation races, stampedes |
| [Batch processing and reliable imports](batch-processing.md) | Input identity, chunk transactions, restartability, reconciliation |
| [SQLite in desktop applications](sqlite.md) | WAL, writer contention, connection settings, backup and upgrades |
| [JavaFX application engineering](javafx.md) | FX thread, tasks, cancellation, bindings, controller boundaries |
| [Geospatial correctness with GeoTools and JTS](geospatial-correctness.md) | CRS, axis order, measurement, topology, resource ownership |
| [Spring Security configuration](spring-security.md) | Filter chains, request rules, CSRF/CORS, method security and tests |
| [Jakarta Faces and PrimeFaces](jakarta-faces-primefaces.md) | Lifecycle, AJAX process/update, scopes, validation and lazy tables |
| [JDBC and HikariCP](jdbc-hikaricp.md) | Connection ownership, pool sizing, timeout budgets and saturation |
| [SQL query tuning and PostgreSQL diagnostics](sql-query-tuning.md) | Execution plans, indexes, statistics, blocking and pagination |
| [JUnit, Mockito, and AssertJ](junit-mockito-assertj.md) | Unit-test boundaries, parameterization, mocks and deterministic fixtures |
| [GitHub Actions for Maven delivery](github-actions-maven.md) | Verification workflows, PR trust, permissions and artifact promotion |
| [Spring Integration in practice](spring-integration.md) | Java DSL, channels, threading, transactions and error handling |
| [HTTP clients and webhook delivery](http-clients-webhooks.md) | Client budgets, signatures, durable reception and replay handling |
| [OpenTelemetry and Micrometer implementation](opentelemetry-micrometer.md) | Instrumentation ownership, OTLP pipelines, metrics and context |
| [Dependency and software supply-chain security](software-supply-chain.md) | Inventory, SBOMs, vulnerability triage and provenance verification |
| [Java date, time, and scheduling](java-time.md) | Temporal types, DST resolution, clocks and recurring jobs |
| [CSV and Excel processing with Apache POI](csv-excel-poi.md) | Format choice, cell types, precision, streaming and import failures |
| [Java desktop packaging and distribution](java-desktop-packaging.md) | Runtime images, native installers, resources and upgrade behavior |
| [Raster GIS and GeoTIFF](raster-gis.md) | Grid alignment, NoData, transforms, resampling and large rasters |
| [TypeScript and runtime validation](typescript.md) | Strict types, unknown values, narrowing, validation and async state |
| [React Native offline data and synchronization](react-native-offline.md) | Local transactions, outbox, conflict resolution and mobile lifecycle |
| [Greenfield, desktop, and web application design](application-design.md) | Vertical slices, data ownership, UI/service boundaries and staged replacement |
| [Scientific model and data integration](scientific-model-integration.md) | Process/library boundaries, units, provenance, numerical validation and repeatability |
| [C](c.md) | Memory ownership, types, undefined behavior, diagnostics and sanitizers |
| [Python](python.md) | Virtual environments, language idioms, files, subprocesses and runtime boundaries |
| [JavaScript](javascript.md) | Runtime semantics, promises, cancellation, Fetch and browser boundaries |
| [Quarkus](quarkus.md) | CDI, configuration phases, REST execution, packaging and native-image tradeoffs |
| [MyBatis](mybatis.md) | SQL mapping, bound parameters, session ownership, transactions and query behavior |
| [Angular](angular.md) | Standalone components, signals, forms, HTTP streams and frontend delivery |
| [Windows and PowerShell diagnostics](windows-powershell.md) | Processes, ports, services, quoting, native commands and runtime context |
| [AWS application operations](aws.md) | Accounts, roles, Regions, service choices, access diagnosis and recovery |
| [Azure application operations](azure.md) | Tenants, subscriptions, identities, service choices, RBAC and networking |
| [Terraform](terraform.md) | Plan review, state protection, version locks, drift, refactoring and apply |
| [Oracle Database](oracle.md) | SQL dialect, types, DDL commits, JDBC behavior and query diagnostics |
| [DynamoDB](dynamodb.md) | Access patterns, keys, indexes, query pagination, consistency and conditional writes |
| [H2 database](h2.md) | Embedded URLs, in-memory lifetime, SQL fixtures and target-engine test boundaries |
| [CloudTrail and CloudWatch](cloudtrail-cloudwatch.md) | AWS audit events, metrics, Logs Insights, alarms and retention |
| [Splunk search and operations](splunk.md) | SPL pipelines, field extraction, aggregation, ingestion and alert checks |
| [Microsoft Entra ID, SSO, and JWT](entra-id.md) | App registrations, identity flows, API token validation and permission diagnosis |
| [Secrets management](secrets-management.md) | Workload identity, credential delivery, rotation, revocation and exposure paths |
| [Application licensing and telemetry](licensing-telemetry.md) | Entitlements, signed licenses, offline policy, usage events and reconciliation |
| [Linters, static analysis, SAST, and coverage](static-analysis-coverage.md) | Quality signals, JaCoCo wiring, thresholds, suppression and CI gates |
| [Reproducible Maven builds and releases](reproducible-builds.md) | Controlled build inputs, archive timestamps, artifact comparison and release evidence |
| [Jenkins Maven pipelines](jenkins.md) | Declarative verification, agent trust, credentials, test reports and promotion |
| [GitLab CI/CD for Maven](gitlab-ci.md) | Workflow rules, Maven verification, runners, artifacts and protected releases |
| [Software licensing and IP compliance](licensing-ip-compliance.md) | Component provenance, SPDX, notices, distribution context and release evidence |

Containers and Docker are one sheet. Authentication and authorization are separate on purpose.

## Resume skills coverage

This map connects the résumé skills to their practical references. A skill can span several sheets; existing coverage is reused instead of duplicating a sheet for every résumé phrase. Reviewed: 2026-09-25.

### Software architecture and integration

| Skill | Cheat sheets |
|-------|--------------|
| Greenfield application design and development | [Application design](application-design.md), [architecture styles](architecture-styles.md), [ADRs](architecture-decisions.md) |
| REST APIs | [REST APIs](rest-apis.md), [OpenAPI and JSON Schema](openapi-and-json-schema.md) |
| Third-party API integration | [HTTP clients and webhooks](http-clients-webhooks.md), [resilience](resilience.md), [integration patterns](enterprise-integration-patterns.md) |
| Scientific model and data integration | [Scientific model integration](scientific-model-integration.md), [batch processing](batch-processing.md), [integration transformation](integration-transformation.md) |
| Modernization of existing applications | [Application design](application-design.md), [Java/Jakarta modernization](java-jakarta-modernization.md), [database migrations](database-migrations.md) |
| Desktop and web application architecture | [Application design](application-design.md), [modular monoliths](modular-monoliths.md), [JavaFX](javafx.md), [Spring Boot](spring-boot.md) |

### Languages and frameworks

| Skill | Cheat sheets |
|-------|--------------|
| Java | [Java](java.md), [concurrency](java-concurrency.md), [date/time](java-time.md), [JVM performance](jvm-performance.md) |
| C | [C](c.md) |
| Python | [Python](python.md) |
| SQL | [SQL and relational modeling](sql.md), [query tuning](sql-query-tuning.md), [transactions](transactions-and-isolation.md) |
| Bash / shell scripting | [Bash](bash.md), [Windows/PowerShell](windows-powershell.md) |
| TypeScript | [TypeScript and runtime validation](typescript.md) |
| JavaScript | [JavaScript](javascript.md) |
| Spring Boot | [Spring Boot](spring-boot.md), [Spring Security](spring-security.md) |
| Quarkus | [Quarkus](quarkus.md) |
| MyBatis | [MyBatis](mybatis.md) |
| JSF / PrimeFaces | [Jakarta Faces and PrimeFaces](jakarta-faces-primefaces.md), [Java/Jakarta modernization](java-jakarta-modernization.md) |
| Angular | [Angular](angular.md) |
| JavaFX | [JavaFX](javafx.md), [desktop packaging](java-desktop-packaging.md) |
| GeoTools / Java Topology Suite (JTS) | [Geospatial correctness with GeoTools and JTS](geospatial-correctness.md), [raster GIS](raster-gis.md) |

### Platforms and operations

| Skill | Cheat sheets |
|-------|--------------|
| Windows | [Windows and PowerShell diagnostics](windows-powershell.md) |
| Linux | [Linux diagnostics](linux-diagnostics.md), [Bash](bash.md) |
| Docker | [Docker and containers](docker.md) |
| OpenShift | [Kubernetes and OpenShift](kubernetes-openshift.md) |
| AWS | [AWS application operations](aws.md) |
| Azure | [Azure application operations](azure.md) |
| Terraform | [Terraform](terraform.md) |
| Oracle Database | [Oracle Database](oracle.md) |
| DynamoDB | [DynamoDB](dynamodb.md) |
| H2 | [H2 database](h2.md) |
| CloudTrail / CloudWatch | [CloudTrail and CloudWatch](cloudtrail-cloudwatch.md) |
| Splunk | [Splunk search and operations](splunk.md) |

### Authentication and security

| Skill | Cheat sheets |
|-------|--------------|
| Microsoft Entra ID | [Entra ID, SSO, and JWT](entra-id.md) |
| Single sign-on (SSO) | [Entra ID, SSO, and JWT](entra-id.md), [authentication](authentication.md) |
| JWT authentication | [Authentication](authentication.md), [Entra API token validation](entra-id.md), [Spring Security](spring-security.md) |
| Secrets management | [Secrets management](secrets-management.md) |
| Licensing telemetry | [Application licensing and telemetry](licensing-telemetry.md) |

### Software quality and configuration management

| Skill | Cheat sheets |
|-------|--------------|
| Git and release tags | [Git](git.md), [reproducible builds and releases](reproducible-builds.md) |
| Maven / dependency management | [Maven](maven.md), [software supply chain](software-supply-chain.md) |
| Linters and static analysis | [Static analysis and coverage](static-analysis-coverage.md) |
| JUnit / Mockito / unit testing | [JUnit, Mockito, and AssertJ](junit-mockito-assertj.md), [TDD](tdd.md), [testing](testing.md) |
| Code coverage | [Static analysis and JaCoCo coverage](static-analysis-coverage.md) |
| Reproducible builds | [Reproducible Maven builds and releases](reproducible-builds.md) |
| Jenkins | [Jenkins Maven pipelines](jenkins.md) |
| GitLab CI/CD | [GitLab CI/CD for Maven](gitlab-ci.md) |
| GitHub CI/CD | [GitHub Actions for Maven](github-actions-maven.md) |
| SAST | [Static analysis, SAST, and coverage](static-analysis-coverage.md), [application security](application-security.md) |
| SBOM generation | [Software supply chain and CycloneDX](software-supply-chain.md) |
| Licensing and IP compliance | [Software licensing and IP compliance](licensing-ip-compliance.md) |

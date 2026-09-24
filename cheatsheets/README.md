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

Containers and Docker are one sheet. Authentication and authorization are separate on purpose.

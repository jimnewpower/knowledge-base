# Software Engineering Knowledge Base

Working collection of **software engineering and software architecture** notes: decisions, patterns, practices, integration approaches, and operating guidance that should survive beyond a single project or conversation.

This repository is a portable memory for design judgment. It is not source code, not a second product backlog, and not a dump of vendor documentation. Notes here capture *why* a shape was chosen, what it costs, when it fails, and how to implement it in a real stack.

Digital Engineering (threads, twins, PLM, MBSE) is an important *application domain* for this collection. It is not the mission of the repository. Domain-specific DE doctrine and the long-form DE agent charter live in [jimnewpower/digital-engineering](https://github.com/jimnewpower/digital-engineering).

---

## Mission

Produce **actionable synthesis for building and evolving software systems**.

Primary questions this collection exists to answer:

- What architecture is defensible for this class of system, and why not the alternatives?
- Where does authority live — data, API, workflow, identity, configuration — and what happens when those disagree?
- How do we modernize a brownfield system without a rip-and-replace?
- What does “good” look like for interfaces, modularity, quality gates, and operability in the stacks we actually ship?
- Which practices compound across projects, and which are local exceptions?

A knowledge note is done when a future engineer (or agent) can apply it without re-deriving the tradeoff from scratch.

---

## Scope

### In scope — software engineering and architecture

- System and application architecture: modular monoliths, services, desktops, batch, integration hubs
- Interface design: REST and related HTTP APIs, schema and contract discipline, versioning, idempotency, error models
- Data architecture: transactional stores, embedded stores, mapping layers, migration, ownership of records
- Integration: third-party APIs, adapters, events, files, scientific models and geospatial pipelines as software systems
- Delivery architecture: build, packaging, containers, CI quality gates, environment promotion, observability
- Modernization: Java and framework upgrades, strangler patterns, coexistence with legacy UIs and schemas
- Engineering practice: testing strategy, static analysis, dependency and SBOM hygiene, code layout, review standards
- Architecture decision records and the rationale that would otherwise live only in someone’s head

Primary technical context is the work this collection is meant to serve: enterprise Java and related services, scientific and geospatial software, desktop and web clients, and the platforms those systems run on (Linux, containers, OpenShift, AWS, and similar).

### Also in scope — domain notes that inform the software

Notes about Digital Engineering, geospatial analysis, or a specific product are welcome **when they change how the software should be structured**: identity of objects, system-of-record boundaries, API contracts, lineage, deployment constraints, classification or data-rights effects on design.

Put those notes under a domain folder. Do not let domain survey papers crowd out architecture and practice.

### Out of scope

- A second copy of a product repository or ticket tracker
- Vendor marketing restated as architecture
- Invented customer-internal or lab-internal details
- Third-party copyrighted manuals dumped wholesale
- Digital-thread / digital-twin survey work whose home is already the Digital Engineering corpus

---

## Audience

Software architects, senior engineers, and the agents that help them design and ship systems.

Every major note should answer, in practical terms:

> What should we build, how should it be structured, and what will go wrong if we choose the convenient alternative?

When the system lives in a governed or brownfield environment, say so and design for it. Do not assume a greenfield cloud-native blank page unless the note is explicitly about that case.

---

## Architectural stance

These are working heuristics, not a taxonomy to enforce on every system.

1. **Name the system of record before drawing boxes.** Integration diagrams that skip ownership produce shadow databases.
2. **Prefer progressive enhancement over rip-and-replace.** Strangle, wrap, and coexist when the existing system still carries authority.
3. **Contracts are architecture.** Public APIs, events, file formats, and database schemas that other teams depend on are decisions; treat them like ADRs.
4. **Hybrid is normal.** A modular monolith with clear module boundaries is often better than a fleet of services that share a database. Services earn their keep when independently deployable authority requires them.
5. **Delivery is part of the design.** Packaging, gates, configuration, and operability are not afterthoughts bolted onto a logical architecture.
6. **Domain constraints bind the software.** Classification, data rights, air-gapped or governed delivery, long-lived scientific codes, and desktop/offline use are first-class requirements when they apply.

Digital Engineering pattern language (PLM-centric vs federated vs semantic overlay) belongs in domain notes. It is not the default lens for a compiler, a REST service, or a JavaFX client.

---

## Guiding principles

1. Prefer primary sources and running systems over slides and vendor blogs.
2. Capture the technical shape *and* the organizational constraint that made it necessary.
3. Write tradeoffs. A pattern without failure modes is a slogan.
4. Favor small, reversible steps and crawl-walk-run paths for modernization.
5. Synthesis over invention — build on prior notes and cited evidence.
6. Label inference. Do not present a cost, timeline, or “industry standard” as fact without a source.
7. Keep language precise: module, service, system of record, contract, adapter, facade — not “platform” for everything.

---

## Source hierarchy

**Tier 1 — start here**

- Running code and schemas in the relevant product repositories
- Existing notes and ADRs in this knowledge base
- Official specs and RFCs for the interface style in use (HTTP, OpenAPI, SQL dialects, language specs)
- Platform and framework documentation for the version actually deployed

**Tier 2**

- Established architecture references (e.g. fundamentals of software architecture, enterprise integration patterns, domain-driven design used as vocabulary — not as liturgy)
- Language and framework evolution notes (Java LTS lines, Spring, Jakarta EE, and peers) from primary maintainers

**Tier 3**

- High-quality case studies and vendor reference architectures, qualified against deployment evidence
- Peer-reviewed software-engineering papers when they change a design choice

Qualify marketing claims. Prefer what shipped.

---

## How notes are written

### Architecture or practice note

Use this skeleton for major notes (`Topic_Name.md` or `NNNN-short-title.md` for decisions):

1. Title and one-paragraph purpose
2. Context — system class, constraints, what is already in place
3. Problem or question the note settles
4. Options considered, with tradeoffs
5. Recommendation and why it wins *here*
6. Structure — modules, contracts, data ownership, runtime view as needed
7. Delivery and operability implications
8. Failure modes, migration path, and what would change the decision
9. References

Deep dives that compare several approaches can run long. Decision records should stay short enough to reread before a design review.

### Style

- Professional, precise, practical
- Structured Markdown (H1 / H2 / H3), bullets and tables
- Explicit pros/cons when comparing options
- Cite sources; label inference
- Neutral voice — no brochure language
- KaTeX for formal expressions when needed

### Naming and placement

| Kind | Location | Name |
|------|----------|------|
| Architecture notes | `architecture/` | `Topic_Name.md` |
| Architecture decision records | `decisions/` | `NNNN-short-title.md` |
| Engineering practices | `practices/` | short topic name |
| API and contract notes | `interfaces/` | topic or protocol name |
| Delivery, CI, packaging | `delivery/` | short topic name |
| Runbooks | `runbooks/` | imperative title |
| Domain notes that bind the software | `domains/<name>/` | topic name |
| Digital Engineering, when it affects software shape | `domains/digital-engineering/` | topic name |
| Quick-reference cheat sheets | `cheatsheets/` | short topic name |

Update the index in this README when a major note lands. Do not leave generation scripts next to deliverables.

---

## Repository layout

```text
.
├── README.md                 # purpose, doctrine, and index
├── LICENSE                   # GPL-3.0
├── app/                      # local search and reader
├── cheatsheets/              # keyboard-ready language and practice sheets
├── architecture/             # system and application design notes
├── decisions/                # architecture decision records
├── practices/                # engineering standards that should recur
├── interfaces/               # APIs, schemas, contract rules
├── delivery/                 # build, package, deploy, observe
├── runbooks/                 # repeatable operating procedures
└── domains/                  # domain constraints that change the software
    └── digital-engineering/  # DE only when it drives design
```

Directories other than `cheatsheets/` are created when the first real note needs them.

---

## Browse locally

The reader in `app/` indexes the Markdown notes in this repository and renders them in a browser. Its homepage offers nine topic categories; category pages group notes with summaries, content-type and topic filters, and selected related links. Search and the sidebar's **All files** view also cover the complete collection.

```powershell
cd app
npm install
npm start
```

Opens http://127.0.0.1:5180. Press `/` to focus search.

http://127.0.0.1:5180/?q=rebase&doc=cheatsheets/git.md

Keyboard shortcuts and index rules are in `app/README.md`.

---

## Cheat sheets

Indexed in [cheatsheets/README.md](cheatsheets/README.md), including a [résumé skills coverage map](cheatsheets/README.md#resume-skills-coverage).

| Sheet | Path |
|-------|------|
| Git | [cheatsheets/git.md](cheatsheets/git.md) |
| Bash | [cheatsheets/bash.md](cheatsheets/bash.md) |
| Java | [cheatsheets/java.md](cheatsheets/java.md) |
| Java library reference | [cheatsheets/java-libraries.md](cheatsheets/java-libraries.md) |
| Python library reference | [cheatsheets/python-libraries.md](cheatsheets/python-libraries.md) |
| REST APIs | [cheatsheets/rest-apis.md](cheatsheets/rest-apis.md) |
| Authentication | [cheatsheets/authentication.md](cheatsheets/authentication.md) |
| Authorization | [cheatsheets/authorization.md](cheatsheets/authorization.md) |
| Maven | [cheatsheets/maven.md](cheatsheets/maven.md) |
| AI prompt and context engineering | [cheatsheets/ai-prompt-and-context-engineering.md](cheatsheets/ai-prompt-and-context-engineering.md) |
| Clean code and SOLID | [cheatsheets/clean-code-and-solid.md](cheatsheets/clean-code-and-solid.md) |
| Object-oriented design | [cheatsheets/ood.md](cheatsheets/ood.md) |
| UML | [cheatsheets/uml.md](cheatsheets/uml.md) |
| C4 architecture diagrams | [cheatsheets/c4-diagrams.md](cheatsheets/c4-diagrams.md) |
| Structurizr DSL | [cheatsheets/structurizr-dsl.md](cheatsheets/structurizr-dsl.md) |
| Software architecture styles | [cheatsheets/architecture-styles.md](cheatsheets/architecture-styles.md) |
| Domain-driven design | [cheatsheets/domain-driven-design.md](cheatsheets/domain-driven-design.md) |
| Architecture decision records | [cheatsheets/architecture-decisions.md](cheatsheets/architecture-decisions.md) |
| Quality attributes and architecture review | [cheatsheets/quality-attributes.md](cheatsheets/quality-attributes.md) |
| Architecture documentation with arc42 | [cheatsheets/architecture-documentation.md](cheatsheets/architecture-documentation.md) |
| Docker and containers | [cheatsheets/docker.md](cheatsheets/docker.md) |
| Data structures | [cheatsheets/data-structures.md](cheatsheets/data-structures.md) |
| Algorithms | [cheatsheets/algorithms.md](cheatsheets/algorithms.md) |
| DevOps | [cheatsheets/devops.md](cheatsheets/devops.md) |
| Distributed systems | [cheatsheets/distributed-systems.md](cheatsheets/distributed-systems.md) |
| Markdown | [cheatsheets/markdown.md](cheatsheets/markdown.md) |
| Regular expressions | [cheatsheets/regex.md](cheatsheets/regex.md) |
| TDD | [cheatsheets/tdd.md](cheatsheets/tdd.md) |
| SQL and relational modeling | [cheatsheets/sql.md](cheatsheets/sql.md) |
| Spring Boot | [cheatsheets/spring-boot.md](cheatsheets/spring-boot.md) |
| HTTP and TLS | [cheatsheets/http-and-tls.md](cheatsheets/http-and-tls.md) |
| Transactions and isolation | [cheatsheets/transactions-and-isolation.md](cheatsheets/transactions-and-isolation.md) |
| Kubernetes and OpenShift | [cheatsheets/kubernetes-openshift.md](cheatsheets/kubernetes-openshift.md) |
| Testing beyond the unit | [cheatsheets/testing.md](cheatsheets/testing.md) |
| Observability | [cheatsheets/observability.md](cheatsheets/observability.md) |
| Java concurrency | [cheatsheets/java-concurrency.md](cheatsheets/java-concurrency.md) |
| Resilience and integration failure | [cheatsheets/resilience.md](cheatsheets/resilience.md) |
| Design patterns | [cheatsheets/design-patterns.md](cheatsheets/design-patterns.md) |
| OpenAPI and JSON Schema | [cheatsheets/openapi-and-json-schema.md](cheatsheets/openapi-and-json-schema.md) |
| Application security | [cheatsheets/application-security.md](cheatsheets/application-security.md) |
| JVM performance and GC | [cheatsheets/jvm-performance.md](cheatsheets/jvm-performance.md) |
| Linux diagnostics | [cheatsheets/linux-diagnostics.md](cheatsheets/linux-diagnostics.md) |
| Messaging and events | [cheatsheets/messaging-and-events.md](cheatsheets/messaging-and-events.md) |
| Enterprise Integration Patterns | [cheatsheets/enterprise-integration-patterns.md](cheatsheets/enterprise-integration-patterns.md) |
| Integration routing and coordination | [cheatsheets/integration-routing-and-coordination.md](cheatsheets/integration-routing-and-coordination.md) |
| Integration transformation | [cheatsheets/integration-transformation.md](cheatsheets/integration-transformation.md) |
| Enterprise Service Bus | [cheatsheets/enterprise-service-bus.md](cheatsheets/enterprise-service-bus.md) |
| API Gateway | [cheatsheets/api-gateway.md](cheatsheets/api-gateway.md) |
| JPA and Hibernate | [cheatsheets/jpa-and-hibernate.md](cheatsheets/jpa-and-hibernate.md) |
| Java and Jakarta modernization | [cheatsheets/java-jakarta-modernization.md](cheatsheets/java-jakarta-modernization.md) |
| Modular monoliths and architectural boundaries | [cheatsheets/modular-monoliths.md](cheatsheets/modular-monoliths.md) |
| Database migrations and backfills | [cheatsheets/database-migrations.md](cheatsheets/database-migrations.md) |
| Jackson and JSON serialization | [cheatsheets/jackson-json.md](cheatsheets/jackson-json.md) |
| Caching and invalidation | [cheatsheets/caching.md](cheatsheets/caching.md) |
| Batch processing and reliable imports | [cheatsheets/batch-processing.md](cheatsheets/batch-processing.md) |
| SQLite in desktop applications | [cheatsheets/sqlite.md](cheatsheets/sqlite.md) |
| JavaFX application engineering | [cheatsheets/javafx.md](cheatsheets/javafx.md) |
| Geospatial correctness with GeoTools and JTS | [cheatsheets/geospatial-correctness.md](cheatsheets/geospatial-correctness.md) |
| Spring Security configuration | [cheatsheets/spring-security.md](cheatsheets/spring-security.md) |
| Jakarta Faces and PrimeFaces | [cheatsheets/jakarta-faces-primefaces.md](cheatsheets/jakarta-faces-primefaces.md) |
| JDBC and HikariCP | [cheatsheets/jdbc-hikaricp.md](cheatsheets/jdbc-hikaricp.md) |
| SQL query tuning and PostgreSQL diagnostics | [cheatsheets/sql-query-tuning.md](cheatsheets/sql-query-tuning.md) |
| JUnit, Mockito, and AssertJ | [cheatsheets/junit-mockito-assertj.md](cheatsheets/junit-mockito-assertj.md) |
| GitHub Actions for Maven delivery | [cheatsheets/github-actions-maven.md](cheatsheets/github-actions-maven.md) |
| Spring Integration in practice | [cheatsheets/spring-integration.md](cheatsheets/spring-integration.md) |
| HTTP clients and webhook delivery | [cheatsheets/http-clients-webhooks.md](cheatsheets/http-clients-webhooks.md) |
| OpenTelemetry and Micrometer implementation | [cheatsheets/opentelemetry-micrometer.md](cheatsheets/opentelemetry-micrometer.md) |
| Dependency and software supply-chain security | [cheatsheets/software-supply-chain.md](cheatsheets/software-supply-chain.md) |
| Java date, time, and scheduling | [cheatsheets/java-time.md](cheatsheets/java-time.md) |
| CSV and Excel processing with Apache POI | [cheatsheets/csv-excel-poi.md](cheatsheets/csv-excel-poi.md) |
| Java desktop packaging and distribution | [cheatsheets/java-desktop-packaging.md](cheatsheets/java-desktop-packaging.md) |
| Raster GIS and GeoTIFF | [cheatsheets/raster-gis.md](cheatsheets/raster-gis.md) |
| TypeScript and runtime validation | [cheatsheets/typescript.md](cheatsheets/typescript.md) |
| React Native offline data and synchronization | [cheatsheets/react-native-offline.md](cheatsheets/react-native-offline.md) |
| Greenfield, desktop, and web application design | [cheatsheets/application-design.md](cheatsheets/application-design.md) |
| Scientific model and data integration | [cheatsheets/scientific-model-integration.md](cheatsheets/scientific-model-integration.md) |
| C | [cheatsheets/c.md](cheatsheets/c.md) |
| Python | [cheatsheets/python.md](cheatsheets/python.md) |
| JavaScript | [cheatsheets/javascript.md](cheatsheets/javascript.md) |
| Quarkus | [cheatsheets/quarkus.md](cheatsheets/quarkus.md) |
| MyBatis | [cheatsheets/mybatis.md](cheatsheets/mybatis.md) |
| Angular | [cheatsheets/angular.md](cheatsheets/angular.md) |
| Windows and PowerShell diagnostics | [cheatsheets/windows-powershell.md](cheatsheets/windows-powershell.md) |
| AWS application operations | [cheatsheets/aws.md](cheatsheets/aws.md) |
| Azure application operations | [cheatsheets/azure.md](cheatsheets/azure.md) |
| Terraform | [cheatsheets/terraform.md](cheatsheets/terraform.md) |
| Oracle Database | [cheatsheets/oracle.md](cheatsheets/oracle.md) |
| DynamoDB | [cheatsheets/dynamodb.md](cheatsheets/dynamodb.md) |
| H2 database | [cheatsheets/h2.md](cheatsheets/h2.md) |
| CloudTrail and CloudWatch | [cheatsheets/cloudtrail-cloudwatch.md](cheatsheets/cloudtrail-cloudwatch.md) |
| Splunk search and operations | [cheatsheets/splunk.md](cheatsheets/splunk.md) |
| Microsoft Entra ID, SSO, and JWT | [cheatsheets/entra-id.md](cheatsheets/entra-id.md) |
| Secrets management | [cheatsheets/secrets-management.md](cheatsheets/secrets-management.md) |
| Application licensing and telemetry | [cheatsheets/licensing-telemetry.md](cheatsheets/licensing-telemetry.md) |
| Linters, static analysis, SAST, and coverage | [cheatsheets/static-analysis-coverage.md](cheatsheets/static-analysis-coverage.md) |
| Reproducible Maven builds and releases | [cheatsheets/reproducible-builds.md](cheatsheets/reproducible-builds.md) |
| Jenkins Maven pipelines | [cheatsheets/jenkins.md](cheatsheets/jenkins.md) |
| GitLab CI/CD for Maven | [cheatsheets/gitlab-ci.md](cheatsheets/gitlab-ci.md) |
| Software licensing and IP compliance | [cheatsheets/licensing-ip-compliance.md](cheatsheets/licensing-ip-compliance.md) |

---

## How to add knowledge

1. Search this README and existing notes before writing. Cross-link; do not duplicate.
2. Decide whether the note is an architecture explanation, an ADR, a practice, a contract rule, a runbook, a cheat sheet, or a domain constraint.
3. Research in hierarchy order: running systems and specs first.
4. Write the tradeoff. State what would falsify the recommendation.
5. Record durable facts so the next session does not rediscover them.
6. Index the note here when it is ready.

Filing is cheap. Unverified claims are not safe to compound. People own the truth.

---

## Guardrails

- Do not turn this repository into a Digital Engineering survey by default.
- Do not invent customer or laboratory internals.
- Do not copy vendor marketing uncritically.
- Do not recommend a service decomposition, a framework rewrite, or a platform migration without the failure mode and a coexistence path.
- Do not treat the knowledge base as the system of record for product data.
- When uncertain, say so.

---

## Related collections

| Collection | Role relative to this repo |
|------------|----------------------------|
| This repository | Software engineering and architecture knowledge |
| [jimnewpower/digital-engineering](https://github.com/jimnewpower/digital-engineering) | Domain corpus for Digital Threads, Twins, and MBE — cite it, do not fork it here |
| [jimnewpower/launch-monitor-de](https://github.com/jimnewpower/launch-monitor-de) | Worked example of software + digital-engineering packaging on a constrained system |
| Product repositories (`meridian`, `apis`, and others) | Systems of record for code and schemas |
| [newpower.dev](https://newpower.dev) | Public professional context |

---

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).

---

*Last updated: 2026-09-25*

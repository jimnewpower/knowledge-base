import type { Category } from "../lib/catalog";

// Each note has one primary home; related links never change that ownership.
export const categories: Category[] = [
  {
    id: "architecture-design",
    title: "Architecture & Design",
    description: "Structure systems, communicate designs, and record decisions.",
    sections: [
      { title: "Diagrams & Communication", pages: [
        {"path":"cheatsheets/c4-diagrams.md","description":"Context, container, component, dynamic, and deployment views","tags":["Modeling"]},
        {"path":"cheatsheets/structurizr-dsl.md","description":"Model architecture as code, validate workspaces, and export views","tags":["Modeling"]},
        {"path":"cheatsheets/uml.md","description":"Diagrams that earn their keep","tags":["Modeling"]},
        {"path":"cheatsheets/architecture-documentation.md","description":"Organize architecture views, decisions, risks, and authoritative sources","tags":[]},
      ] },
      { title: "System Structure", pages: [
        {"path":"cheatsheets/application-design.md","description":"Vertical slices, data ownership, UI/service boundaries and staged replacement","tags":["Modeling","Modernization"]},
        {"path":"cheatsheets/architecture-styles.md","description":"Compare layers, modules, services, events, workers, and plugins","tags":["Modeling"]},
        {"path":"cheatsheets/modular-monoliths.md","description":"Module APIs, ports/adapters, data ownership, extraction decisions","tags":["Modernization"]},
        {"path":"cheatsheets/distributed-systems.md","description":"Failure, consistency, coordination","tags":["Reliability"]},
      ] },
      { title: "Domain & Code Design", pages: [
        {"path":"cheatsheets/domain-driven-design.md","description":"Bounded contexts, context maps, aggregates, and domain language","tags":["Modeling"]},
        {"path":"cheatsheets/ood.md","description":"Objects, responsibilities, composition","tags":["Modeling"]},
        {"path":"cheatsheets/design-patterns.md","description":"GoF and enterprise names","tags":[]},
        {"path":"cheatsheets/clean-code-and-solid.md","description":"Readability and design principles","tags":[]},
      ] },
      { title: "Decisions & Evaluation", pages: [
        {"path":"cheatsheets/architecture-decisions.md","description":"Capture constraints, alternatives, consequences, and revisit triggers","tags":[]},
        {"path":"cheatsheets/quality-attributes.md","description":"Measurable scenarios, tradeoffs, and architecture fitness checks","tags":["Reliability"]},
      ] },
    ],
    related: [],
  },
  {
    id: "languages-tools",
    title: "Languages & Developer Tools",
    description: "Work effectively with languages, algorithms, and everyday tools.",
    sections: [
      { title: "Java & the JVM", pages: [
        {"path":"cheatsheets/java.md","description":"Language, types, concurrency, modern Java","tags":["Java"]},
        {"path":"cheatsheets/java-concurrency.md","description":"Happens-before, pools, virtual threads","tags":["Java","Performance"]},
        {"path":"cheatsheets/java-time.md","description":"Temporal types, DST resolution, clocks and recurring jobs","tags":["Java"]},
        {"path":"cheatsheets/jvm-performance.md","description":"Heap, allocation, pauses","tags":["Java","Performance"]},
      ] },
      { title: "Languages & Fundamentals", pages: [
        {"path":"cheatsheets/javascript.md","description":"Runtime semantics, promises, cancellation, Fetch and browser boundaries","tags":[]},
        {"path":"cheatsheets/python.md","description":"Virtual environments, language idioms, files, subprocesses and runtime boundaries","tags":["Python"]},
        {"path":"cheatsheets/c.md","description":"Memory ownership, types, undefined behavior, diagnostics and sanitizers","tags":[]},
        {"path":"cheatsheets/typescript.md","description":"Strict types, unknown values, narrowing, validation and async state","tags":[]},
        {"path":"cheatsheets/data-structures.md","description":"When to use which structure","tags":["Performance"]},
        {"path":"cheatsheets/algorithms.md","description":"Complexity and core algorithms","tags":["Performance"]},
        {"path":"cheatsheets/regex.md","description":"Pattern matching","tags":[]},
      ] },
      { title: "Library References", pages: [
        {"path":"cheatsheets/java-libraries.md","description":"JDK APIs, Maven coordinates, library selection, testing, desktop and GIS","tags":["Java"]},
        {"path":"cheatsheets/python-libraries.md","description":"Standard library, package/import names, HTTP, scientific computing, GIS and testing","tags":["Python"]},
      ] },
      { title: "Developer Workflow", pages: [
        {"path":"cheatsheets/git.md","description":"Branching, history, undo, collaboration","tags":[]},
        {"path":"cheatsheets/bash.md","description":"Shell, pipelines, scripting on Linux","tags":[]},
        {"path":"cheatsheets/maven.md","description":"Build, dependencies, multi-module Java","tags":["Java"]},
        {"path":"cheatsheets/markdown.md","description":"Notation used in this repository","tags":[]},
        {"path":"cheatsheets/ai-prompt-and-context-engineering.md","description":"Prompts, context windows, agent working memory","tags":[]},
      ] },
    ],
    related: [],
  },
  {
    id: "application-development",
    title: "Application Development",
    description: "Build and modernize web, desktop, and mobile applications.",
    sections: [
      { title: "Web Applications", pages: [
        {"path":"cheatsheets/angular.md","description":"Standalone components, signals, forms, HTTP streams and frontend delivery","tags":[]},
        {"path":"cheatsheets/quarkus.md","description":"CDI, configuration phases, REST execution, packaging and native-image tradeoffs","tags":["Java"]},
        {"path":"cheatsheets/spring-boot.md","description":"Wiring, config, web, actuator","tags":["Java"]},
        {"path":"cheatsheets/jakarta-faces-primefaces.md","description":"Lifecycle, AJAX process/update, scopes, validation and lazy tables","tags":["Java","Modernization"]},
      ] },
      { title: "Desktop & Mobile", pages: [
        {"path":"cheatsheets/javafx.md","description":"FX thread, tasks, cancellation, bindings, controller boundaries","tags":["Java","Offline"]},
        {"path":"cheatsheets/java-desktop-packaging.md","description":"Runtime images, native installers, resources and upgrade behavior","tags":["Java","Offline"]},
        {"path":"cheatsheets/react-native-offline.md","description":"Local transactions, outbox, conflict resolution and mobile lifecycle","tags":["Offline","Reliability"]},
      ] },
      { title: "Modernization", pages: [
        {"path":"cheatsheets/java-jakarta-modernization.md","description":"Compatibility matrices, namespace changes, staged upgrades","tags":["Java","Modernization"]},
      ] },
    ],
    related: ["cheatsheets/spring-security.md"],
  },
  {
    id: "apis-integration",
    title: "APIs & Integration",
    description: "Connect systems through APIs, messages, and workflows.",
    sections: [
      { title: "HTTP & API Contracts", pages: [
        {"path":"cheatsheets/rest-apis.md","description":"HTTP APIs, resources, errors, versioning","tags":[]},
        {"path":"cheatsheets/http-and-tls.md","description":"Messages, headers, certificates","tags":[]},
        {"path":"cheatsheets/openapi-and-json-schema.md","description":"HTTP and JSON contracts","tags":[]},
        {"path":"cheatsheets/http-clients-webhooks.md","description":"Client budgets, signatures, durable reception and replay handling","tags":["Reliability"]},
        {"path":"cheatsheets/api-gateway.md","description":"API routing, access policies, aggregation, BFFs","tags":[]},
      ] },
      { title: "Messaging & Integration", pages: [
        {"path":"cheatsheets/scientific-model-integration.md","description":"Process/library boundaries, units, provenance, numerical validation and repeatability","tags":["Modeling","Reliability"]},
        {"path":"cheatsheets/messaging-and-events.md","description":"Brokers, outbox, consumers","tags":["Reliability"]},
        {"path":"cheatsheets/enterprise-integration-patterns.md","description":"Integration styles, channels, endpoints, pattern selection","tags":[]},
        {"path":"cheatsheets/integration-routing-and-coordination.md","description":"Routers, splitters, aggregators, workflow coordination","tags":[]},
        {"path":"cheatsheets/integration-transformation.md","description":"Translators, enrichment, canonical models, Claim Check","tags":[]},
        {"path":"cheatsheets/enterprise-service-bus.md","description":"Shared integration runtimes, legacy mediation, modernization","tags":["Modernization"]},
        {"path":"cheatsheets/spring-integration.md","description":"Java DSL, channels, threading, transactions and error handling","tags":["Java"]},
      ] },
      { title: "Failure & Recovery", pages: [
        {"path":"cheatsheets/resilience.md","description":"Timeouts, retries, idempotency","tags":["Reliability"]},
      ] },
    ],
    related: [],
  },
  {
    id: "data-persistence",
    title: "Data & Persistence",
    description: "Store, query, transform, and move data reliably.",
    sections: [
      { title: "Databases & Transactions", pages: [
        {"path":"cheatsheets/h2.md","description":"Embedded URLs, in-memory lifetime, SQL fixtures and target-engine test boundaries","tags":["Java"]},
        {"path":"cheatsheets/dynamodb.md","description":"Access patterns, keys, indexes, query pagination, consistency and conditional writes","tags":[]},
        {"path":"cheatsheets/oracle.md","description":"SQL dialect, types, DDL commits, JDBC behavior and query diagnostics","tags":[]},
        {"path":"cheatsheets/sql.md","description":"Tables, joins, indexes, migrations","tags":["Modeling"]},
        {"path":"cheatsheets/transactions-and-isolation.md","description":"ACID, levels, outbox","tags":["Reliability"]},
        {"path":"cheatsheets/sqlite.md","description":"WAL, writer contention, connection settings, backup and upgrades","tags":["Offline"]},
        {"path":"cheatsheets/sql-query-tuning.md","description":"Execution plans, indexes, statistics, blocking and pagination","tags":["Performance"]},
      ] },
      { title: "Java Persistence", pages: [
        {"path":"cheatsheets/mybatis.md","description":"SQL mapping, bound parameters, session ownership, transactions and query behavior","tags":["Java"]},
        {"path":"cheatsheets/jpa-and-hibernate.md","description":"Entity lifecycle, relationships, fetching, batching, optimistic locking","tags":["Java"]},
        {"path":"cheatsheets/jdbc-hikaricp.md","description":"Connection ownership, pool sizing, timeout budgets and saturation","tags":["Java","Performance"]},
      ] },
      { title: "Data Lifecycle", pages: [
        {"path":"cheatsheets/database-migrations.md","description":"Expand/contract, checkpoints, concurrent writes, recovery","tags":["Modernization"]},
        {"path":"cheatsheets/caching.md","description":"Cache policies, expiration, refresh, invalidation races, stampedes","tags":["Performance"]},
        {"path":"cheatsheets/batch-processing.md","description":"Input identity, chunk transactions, restartability, reconciliation","tags":["Reliability"]},
      ] },
      { title: "Formats & Serialization", pages: [
        {"path":"cheatsheets/jackson-json.md","description":"DTOs, mapper policy, precision, streaming, Jackson 2/3 boundaries","tags":["Java"]},
        {"path":"cheatsheets/csv-excel-poi.md","description":"Format choice, cell types, precision, streaming and import failures","tags":["Java"]},
      ] },
    ],
    related: [],
  },
  {
    id: "security-identity",
    title: "Security & Identity",
    description: "Protect applications, control access, and secure dependencies.",
    sections: [
      { title: "Identity & Access", pages: [
        {"path":"cheatsheets/entra-id.md","description":"App registrations, identity flows, API token validation and permission diagnosis","tags":[]},
        {"path":"cheatsheets/authentication.md","description":"Proving identity","tags":[]},
        {"path":"cheatsheets/authorization.md","description":"Deciding what an identity may do","tags":[]},
        {"path":"cheatsheets/spring-security.md","description":"Filter chains, request rules, CSRF/CORS, method security and tests","tags":["Java"]},
      ] },
      { title: "Application & Dependency Security", pages: [
        {"path":"cheatsheets/licensing-ip-compliance.md","description":"Component provenance, SPDX, notices, distribution context and release evidence","tags":[]},
        {"path":"cheatsheets/licensing-telemetry.md","description":"Entitlements, signed licenses, offline policy, usage events and reconciliation","tags":["Offline"]},
        {"path":"cheatsheets/secrets-management.md","description":"Workload identity, credential delivery, rotation, revocation and exposure paths","tags":[]},
        {"path":"cheatsheets/application-security.md","description":"Builder-facing OWASP","tags":[]},
        {"path":"cheatsheets/software-supply-chain.md","description":"Inventory, SBOMs, vulnerability triage and provenance verification","tags":[]},
      ] },
    ],
    related: [],
  },
  {
    id: "testing-quality",
    title: "Testing & Quality",
    description: "Verify behavior and build confidence in changes.",
    sections: [
      { title: "Testing Practice", pages: [
        {"path":"cheatsheets/tdd.md","description":"Test-first design loop","tags":[]},
        {"path":"cheatsheets/testing.md","description":"Slices, Testcontainers, contracts","tags":["Reliability"]},
      ] },
      { title: "Java Testing", pages: [
        {"path":"cheatsheets/junit-mockito-assertj.md","description":"Unit-test boundaries, parameterization, mocks and deterministic fixtures","tags":["Java"]},
      ] },
      { title: "Analysis & Quality Gates", pages: [
        {"path":"cheatsheets/static-analysis-coverage.md","description":"Quality signals, JaCoCo wiring, thresholds, suppression and CI gates","tags":["Java"]},
      ] },
    ],
    related: ["cheatsheets/quality-attributes.md"],
  },
  {
    id: "delivery-operations",
    title: "Delivery & Operations",
    description: "Build, deploy, observe, and troubleshoot running software.",
    sections: [
      { title: "Build & Deployment", pages: [
        {"path":"cheatsheets/gitlab-ci.md","description":"Workflow rules, Maven verification, runners, artifacts and protected releases","tags":["Java"]},
        {"path":"cheatsheets/jenkins.md","description":"Declarative verification, agent trust, credentials, test reports and promotion","tags":["Java"]},
        {"path":"cheatsheets/reproducible-builds.md","description":"Controlled build inputs, archive timestamps, artifact comparison and release evidence","tags":["Java"]},
        {"path":"cheatsheets/devops.md","description":"Delivery loop, gates, operability","tags":[]},
        {"path":"cheatsheets/docker.md","description":"Images, containers, Compose","tags":[]},
        {"path":"cheatsheets/kubernetes-openshift.md","description":"Pods, probes, routes, rollouts","tags":[]},
        {"path":"cheatsheets/github-actions-maven.md","description":"Verification workflows, PR trust, permissions and artifact promotion","tags":["Java"]},
      ] },
      { title: "Observability & Diagnostics", pages: [
        {"path":"cheatsheets/splunk.md","description":"SPL pipelines, field extraction, aggregation, ingestion and alert checks","tags":[]},
        {"path":"cheatsheets/cloudtrail-cloudwatch.md","description":"AWS audit events, metrics, Logs Insights, alarms and retention","tags":["Reliability"]},
        {"path":"cheatsheets/windows-powershell.md","description":"Processes, ports, services, quoting, native commands and runtime context","tags":[]},
        {"path":"cheatsheets/observability.md","description":"Logs, metrics, traces, health","tags":["Reliability"]},
        {"path":"cheatsheets/opentelemetry-micrometer.md","description":"Instrumentation ownership, OTLP pipelines, metrics and context","tags":[]},
        {"path":"cheatsheets/linux-diagnostics.md","description":"Process, disk, network, signals","tags":[]},
      ] },
      { title: "Cloud & Infrastructure", pages: [
        {"path":"cheatsheets/terraform.md","description":"Plan review, state protection, version locks, drift, refactoring and apply","tags":[]},
        {"path":"cheatsheets/azure.md","description":"Tenants, subscriptions, identities, service choices, RBAC and networking","tags":[]},
        {"path":"cheatsheets/aws.md","description":"Accounts, roles, Regions, service choices, access diagnosis and recovery","tags":[]},
      ] },
    ],
    related: ["cheatsheets/software-supply-chain.md"],
  },
  {
    id: "gis-geospatial",
    title: "GIS & Geospatial",
    description: "Handle spatial data, coordinate systems, and rasters correctly.",
    sections: [
      { title: "Spatial Data", pages: [
        {"path":"cheatsheets/geospatial-correctness.md","description":"CRS, axis order, measurement, topology, resource ownership","tags":["Java","Modeling"]},
        {"path":"cheatsheets/raster-gis.md","description":"Grid alignment, NoData, transforms, resampling and large rasters","tags":["Performance"]},
      ] },
    ],
    related: [],
  },
];

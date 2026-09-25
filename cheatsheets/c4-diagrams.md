# C4[^c4] architecture diagrams cheat sheet

> Baseline: C4 model terminology and notation-independent diagram guidance. Reviewed: 2026-09-24.

C4 gives architecture conversations **consistent levels of zoom**: context, containers, components, and code. Start with the audience and question; most teams can begin with context and container views and add detail where it resolves uncertainty. See the [C4 diagram guide](https://c4model.com/diagrams).

Related: [Structurizr DSL](structurizr-dsl.md)[^dsl], [UML](uml.md)[^uml], [architecture styles](architecture-styles.md), [arc42 documentation](architecture-documentation.md), [ADRs](architecture-decisions.md)[^adr].

## Choose the view

| View | Scope and question | Show | Leave elsewhere |
|------|--------------------|------|-----------------|
| System context (C1) | One system: who uses it and what surrounds it? | People, system in focus, external systems, purposes of relationships | Internal applications, libraries, infrastructure |
| Container (C2) | One system: which applications and stores cooperate? | Containers, responsibilities, technology, communication | Classes, replicas, failover topology |
| Component (C3) | One container: which internal responsibilities collaborate? | Components and their relevant external dependencies | Every class or every framework bean |
| Code (C4) | One component: how is it implemented? | Selected classes, interfaces, functions; UML can help | An automatically generated dump of the codebase |
| System landscape | A chosen organizational scope | Several systems and their relationships | Detailed internals of every system |
| Dynamic | One scenario | Ordered interactions among selected model elements | The full static dependency graph |
| Deployment | One environment | Instances, deployment nodes, relevant infrastructure | Mixing production and developer topology without labels |

Landscape, dynamic, and deployment diagrams are supporting views, not additional C4 zoom levels. A sequence diagram may explain a runtime scenario more clearly than a numbered collaboration diagram.

## Know what a box means

| Element | Meaning | Example |
|---------|---------|---------|
| Person | A role interacting with software | Analyst, support operator |
| Software system | A system whose responsibilities and boundary are being described | Field Analysis |
| Container | An application or data store | JavaFX desktop, Spring API[^api], project database, raster file store |
| Component | Related functionality behind a defined interface within a container | Import coordinator, scoring engine, catalog adapter |
| Deployment node | An environment that hosts instances | Analyst workstation, JVM[^jvm], VM[^vm], database server |

A **C4 container is not a Docker container**. A JavaFX application qualifies without Docker. Components run within their containing application; a Maven module or Java package is not automatically a C4 component. See [container definitions](https://c4model.com/diagrams/container).

## Worked context view

Illustrative design, not a description of a particular repository. Title: **Field Analysis — system context**. Scope: the complete Field Analysis system. Key: parentheses identify a person; brackets identify software systems; arrows describe the source's use of the destination.

```text
(Analyst)
    |
    | prepares projects and reviews scores using
    v
[Field Analysis]
    |
    | discovers source datasets through
    v
[Dataset Catalog — external]
```

The catalog owns published source metadata. Field Analysis owns local project configuration and derived analysis results. Establishing that authority makes later data-flow discussions concrete.

## Zoom to containers

Title: **Field Analysis — containers**. Scope: Field Analysis. Key: the outer box is the software-system boundary; labeled inner boxes are applications/data stores. The catalog remains an external software system. Relationship arrows describe use, not every return message.

Example abbreviations: JDBC[^jdbc].

```text
(Analyst)
    | prepares projects and reviews scores using
    v
+-- Field Analysis ----------------------------------------+
| [Desktop application: Java / JavaFX] ---------------------+--> [Dataset Catalog]
|    |                               |                    |    external system
|    | manages project settings      | reads/writes rasters|    Discovers datasets
|    | JDBC                          | filesystem I/O      |
|    v                               v                    |
| [Project database: SQLite]    [Raster store: GeoTIFF files]|
+---------------------------------------------------------+
```

The horizontal arrow means “Desktop discovers source datasets through Dataset Catalog via HTTPS[^https] / JSON[^json].” SQLite and the raster store are logical data containers even though they are local files. The SQLite engine can be embedded in the desktop process; this diagram does not imply a database server.

## Zoom selectively to components

Title: **Desktop application — import components**. Scope: the desktop container. This sketch shows runtime collaboration; arrows labeled “calls” are in-process calls, and external I/O[^i-o] is labeled separately.

Example abbreviations: UI[^ui].

```text
Inside Desktop application:
  [Import UI] --calls--> [Import coordinator]
                           |--calls--> [Catalog adapter]
                           |--calls--> [Project repository]
                           +--calls--> [Raster writer]

Across the container boundary:
  [Catalog adapter]    --HTTPS / JSON--> [Dataset Catalog]
  [Project repository] --JDBC---------> [Project database]
  [Raster writer]      --file I/O-----> [Raster store]
```

The coordinator owns the import workflow. Adapters own technology translation. For compile-time dependency inversion, draw a separate dependency view with ports; a runtime arrow does not establish which package imports which.

## Add runtime and deployment evidence

For this example, a useful dynamic scenario is: analyst starts an import; desktop queries catalog; desktop writes raster data; desktop records project metadata. Review cancellation and crashes between those last two steps. The diagram alone does not make the filesystem and database one atomic transaction.

A deployment view would place a desktop instance, project database, and raster store on an analyst workstation, with the catalog hosted elsewhere. Name the environment and backup location. Use additional nodes only when they explain installation, connectivity, trust, or failure. See [C4 deployment guidance](https://c4model.com/diagrams/deployment).

## Review before sharing

- Put the view type, scope, and current/proposed status in the title or caption.
- Give each element a responsibility; “Service” is rarely enough.
- Label arrows with intent and, for inter-process communication, technology. Explain asynchronous delivery and important protocols.
- Keep names consistent across zoom levels and with implementation terminology.
- Explain colors, shapes, borders, and arrow direction in a key. Make meaning readable without color.
- Show relevant external dependencies; leave unrelated internals outside the view.
- Record the source revision and owner. Review diagram changes with code and contract changes.

The official [review checklist](https://c4model.com/diagrams/checklist) checks whether a diagram explains itself. Separately review whether the proposed architecture meets its [quality scenarios](quality-attributes.md).

## Common mistakes

| Mistake | Correction |
|---------|------------|
| Treating C4 as a microservices prescription | Model the actual desktop, monolith, or distributed system |
| Drawing a database under every component | Show real ownership; do not invent independent stores |
| Drawing replicas as separate logical containers | Put instances and replication in a deployment view |
| Mixing source dependencies and runtime calls | Name the relationship semantics or use separate views |
| Labeling every edge “uses” | State the operation or purpose |
| Drawing all four levels by policy | Keep views that answer an actual question |

## References

- [C4 — diagram types](https://c4model.com/diagrams)
- [C4 — container diagram](https://c4model.com/diagrams/container)
- [C4 — deployment diagram](https://c4model.com/diagrams/deployment)
- [C4 — diagram review checklist](https://c4model.com/diagrams/checklist)

[^c4]: Context, Containers, Components, and Code — the four levels of the C4 architecture model.
[^dsl]: Domain-Specific Language.
[^uml]: Unified Modeling Language.
[^adr]: Architecture Decision Record.
[^api]: Application Programming Interface — the contract through which software components interact.
[^jvm]: Java Virtual Machine.
[^vm]: Virtual Machine.
[^https]: Hypertext Transfer Protocol Secure — web communication over an encrypted, authenticated connection.
[^json]: JavaScript Object Notation.
[^i-o]: Input/Output.
[^jdbc]: Java Database Connectivity.
[^ui]: User Interface.

# Greenfield, desktop, and web application design cheat sheet

> Baseline: Java desktop and enterprise web systems; design heuristics rather than a prescribed framework. Reviewed: 2026-09-25.

Start with a working business workflow, explicit data ownership, and measurable constraints. A greenfield application still has existing users, external systems, deployment rules, and data to respect.

Related: [architecture styles](architecture-styles.md), [quality attributes](quality-attributes.md), [modular monoliths](modular-monoliths.md), [modernization](java-jakarta-modernization.md).

## First design pass

| Question | Concrete output |
|----------|-----------------|
| Who uses it, and what must succeed? | Three representative workflows and their failure paths |
| Who owns each fact? | System-of-record map, identifiers, write authority |
| What constrains the design? | Offline use, latency, data size, security, runtime, deployment target |
| What is uncertain? | Small experiment with a pass/fail criterion |
| What will be operated? | Packaging, configuration, upgrade, diagnostics, backup and restore |

Build one vertical slice through UI[^ui]/API[^api], service, persistence, and delivery. Exercise a real integration and an error path before multiplying modules. Record consequential choices in [ADRs](architecture-decisions.md)[^adr].

## Desktop versus web boundaries

| Concern | Desktop | Web |
|---------|---------|-----|
| UI lifecycle | Window/controller state; cancellation when views close | Request/session lifetime; multiple concurrent requests |
| Long operation | Worker task; progress and cancellation on the UI | Background job with status, ownership, and bounded admission |
| Data | Local files/database; recovery after process exit | Shared store; tenant isolation and concurrent updates |
| Distribution | OS[^os]-specific installer, runtime, signing, user-data migration | Immutable server artifact, rollout, configuration, schema coexistence |
| Identity | System browser login; public client cannot protect a shared secret | Server session or API identity; explicit browser/server boundary |

Keep business rules independent of JavaFX controllers, Faces beans, Angular components, HTTP[^http] transport, and persistence mapping. Put transactions around service use cases. A shared domain library can serve multiple clients; sharing UI state or database entities across public APIs usually couples their release cycles.

## Modernize an existing application

1. Record current behavior with representative fixtures, including odd behavior users depend on.
2. Place an adapter around the capability to replace; identify its authoritative writer.
3. Move one workflow and compare results before switching traffic or users.
4. Keep old/new schema and contract versions compatible during coexistence.
5. Retire the old path only after reconciliation and rollback limits are understood.

Avoid an uncoordinated dual-write period. Reverting an executable cannot undo external messages or a destructive schema migration. A rewrite earns its cost through measured constraints, not through framework preference.

## References

- [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/)
- [arc42 architecture documentation structure](https://arc42.org/overview)

[^ui]: User Interface.
[^api]: Application Programming Interface — the contract through which software components interact.
[^adr]: Architecture Decision Record.
[^os]: Operating System.
[^http]: Hypertext Transfer Protocol.

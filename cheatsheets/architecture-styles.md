# Software architecture styles cheat sheet

> Baseline: framework-neutral design choices; recommendations are working heuristics, not universal rankings. Reviewed: 2026-09-24.

Choose architecture around **ownership, invariants, change, and failure**. A style earns its cost when it addresses a concrete constraint better than a simpler alternative.

Related: [C4 diagrams](c4-diagrams.md), [modular monoliths](modular-monoliths.md), [DDD](domain-driven-design.md), [distributed systems](distributed-systems.md), [quality attributes](quality-attributes.md).

## Separate the decisions

| Axis | Examples | Question |
|------|----------|----------|
| Code organization | Layers, capability modules, ports and adapters | What may depend on what? |
| Deployment | Desktop, monolith, independently deployed services | What ships, scales, and fails together? |
| Interaction | Calls, events, queued commands, pipelines | How does work cross a boundary? |
| Data | Shared transaction, owned stores, read projections | Who may change a fact, and when is it consistent? |

These choices compose. A modular monolith can use ports and adapters and publish events. Event-driven interaction does not require microservices. A logical layer is not necessarily a separate physical deployment tier.

## Compare the shapes

The following selection guidance is this collection's synthesis. Microsoft's [architecture styles catalog](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/) provides reference descriptions of layered, worker-based, service, and event-based designs.

| Shape | Good fit | Cost or failure mode | Reconsider when |
|-------|----------|----------------------|-----------------|
| Layered application | Straightforward CRUD, existing enterprise application | Feature changes span layers; domain behavior leaks into controllers or persistence | Unrelated capabilities repeatedly change together |
| Modular monolith | Shared release cadence with distinct business capabilities | Boundaries erode through internal imports and shared table writes | One stable capability needs independent operation |
| Ports and adapters / hexagonal | Domain rules must survive UI, provider, or storage changes | Excess interfaces and mapping when every class becomes a port | The seam has no meaningful alternative or testing benefit |
| Microservices | Independent capability ownership, release, scaling, or isolation | Network failures, version skew, distributed workflows, operational overhead | Services require coordinated deployments and direct database joins |
| Event-driven collaboration | Multiple reactions, asynchronous integration, burst absorption | Lag, duplicates, schema evolution, difficult end-to-end diagnosis | Caller needs an immediate authoritative answer |
| Web/desktop plus background workers | Long imports, reports, scientific calculations | Queue backlog, cancellation, idempotency, work ownership | Queue delay violates the user workflow |
| Pipes and filters | Staged validation, transformation, raster processing | Intermediate storage, incompatible formats, backpressure | Stages need extensive shared mutable state |
| Plugin / microkernel | Stable host with genuinely variable extensions | API compatibility, plugin lifecycle, isolation | Every feature needs privileged access to host internals |

Ports and adapters describes the separation between application policy and external mechanisms; it does not mandate a deployment topology. See [Cockburn's original explanation](https://alistair.cockburn.us/hexagonal-architecture).

## Match constraints to a first design

| Constraint | Starting point | Evidence to gather |
|------------|----------------|--------------------|
| Single-user offline GIS | Desktop application with local stores and background computation | UI latency, import recovery, file/database consistency, upgrade behavior |
| Existing JSF application with shared transactions | Retain deployment; introduce capability boundaries around use cases | Dependency cycles, table writers, release coupling |
| CPU-heavy analysis competes with interactive requests | Isolate work in a bounded executor or worker process | CPU profile, queue age, cancellation, memory limits |
| Independent teams blocked by shared releases | Clarify APIs and data authority, then consider service extraction | Actual release contention and readiness to operate independently |
| Several systems need committed business facts | Durable publication and consumer contracts | Outbox behavior, lag tolerance, replay and reconciliation |

These are starting hypotheses. A desktop may need remote compute; a service may need a shared transaction. Record the constraint that changes the recommendation.

## Before adding a process boundary

1. Identify the capability and the data it owns. List remaining cross-boundary invariants.
2. Define requests, events, errors, compatibility, and who operates the boundary.
3. Budget latency and failure behavior. Decide what the caller sees when the callee is slow or absent.
4. Plan data migration and cutover. Avoid an unowned period where both sides can independently write the same facts.
5. Prove independent deployment, rollback compatibility, observability, and recovery.

A faster server or an in-process module can be the correct answer when release independence is not needed. See [modular monolith extraction guidance](modular-monoliths.md).

## Brownfield migration

For an illustrative legacy import subsystem: define an import facade in the existing application; route one format through a new implementation; compare results on controlled fixtures; switch ownership for that path; retire the old code after reconciliation. If a remote worker becomes necessary later, preserve the facade contract and add explicit job states and recovery semantics.

This is an incremental migration strategy, not evidence that a remote worker is always desirable. Database changes should follow [expand/contract migration](database-migrations.md); a code rollback cannot undo all data transformations.

## Red flags

- A service per table, with cross-service joins required for every request.
- A broker added while consumers still depend on synchronized releases and a shared writable schema.
- A diagram labeled “clean” with framework types embedded in every domain API.
- A plugin system where an extension can corrupt the entire host with no recovery plan.
- “Scalable” without a workload, bottleneck, capacity target, or measurement.

## References

- [Microsoft — architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/)
- [Cockburn — hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture)
- [Spring Modulith — module fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html)

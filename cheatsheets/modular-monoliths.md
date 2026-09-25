# Modular monoliths and architectural boundaries cheat sheet

> Baseline: framework-neutral module design; Spring Modulith is an optional verification tool, not a required architecture. Reviewed: 2026-09-24.

A modular monolith deploys together while keeping **business responsibilities and dependency boundaries explicit**. A package tree helps only when code, data access, and tests respect it.

Related: [object-oriented design](ood.md), [design patterns](design-patterns.md), [architecture styles](architecture-styles.md), [domain-driven design](domain-driven-design.md), [distributed systems](distributed-systems.md), [testing](testing.md).

## Choose the boundary

| Boundary | Question it answers | Avoid |
|----------|---------------------|-------|
| Bounded context | Where does this model and vocabulary apply? | One enterprise-wide `Customer` with incompatible meanings |
| Application module | What capability has a public API[^api] and hidden implementation? | Public access to every repository and entity |
| Aggregate | Which invariants are protected together? | Equating every module with one giant object graph |
| Deployment unit | What is released and operated together? | Assuming separate modules require separate services |

These boundaries can align, but are not synonyms. Begin with use cases, ownership, and change patterns; avoid a module for every table.

## Package by capability

Conceptual layout; the API is deliberately small:

```text
com.example.app
  orders
    api             commands, result DTOs, published events
    internal
      application   use-case coordination
      domain        invariants and policies
      persistence   database adapter
  inventory
    api
    internal
```

`orders` calls `inventory.api`; it does not import `inventory.internal` or query inventory's tables directly. Maven modules or JPMS[^jpms] can strengthen boundaries, but build structure alone does not establish business ownership.

This layout is conceptual, not Spring Modulith's default API convention. Modulith normally exposes a module's base package; exposing an `api` subpackage requires configuring a named interface. See [Modulith fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html).

## Ports and adapters

Example abbreviations: HTTP[^http], JDBC[^jdbc].

```text
HTTP / JavaFX adapter --> application use case --> domain model
                               |
                          outbound port
                               ^
                      JDBC / vendor adapter
```

The port expresses what the application needs; the adapter handles an external technology. Dependency direction points toward the application/domain contract. Runtime calls can travel outward through the port. See [Cockburn's original hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture).

Use a port at a meaningful volatile boundary, such as persistence or an external provider. Do not require an interface for every class or wrap stable language types merely to satisfy a diagram.

## Calls, events, and data

| Choice | Fits when | Consequence to own |
|--------|-----------|--------------------|
| Direct module API call | Caller needs a result now | Explicit dependency; failures propagate to the caller |
| In-process event | Several local reactions are useful | Listener execution/transaction semantics must be understood |
| Durable event/outbox | Reaction must survive a crash | Delivery, deduplication, lag, and recovery become part of the contract |
| Cross-module database transaction | A local atomic invariant requires it | Useful locally; complicates later independent deployment |

Assign one module authority over each writable data set. Shared infrastructure is reasonable; shared mutable domain entities often obscure ownership. Read-only reporting joins may be an intentional exception: document their schema coupling and access policy.

## Enforce the design

Recommended checks:

- Reject module cycles and imports into another module's internals.
- Test exported APIs without reaching into private repositories.
- Keep migrations and table ownership aligned with the responsible module.
- Review public DTO[^dto]/event changes as contracts, even within one repository.
- Test whether local events are synchronous, transactional, or durable instead of inferring behavior from their names.

[Spring Modulith verification](https://docs.spring.io/spring-modulith/reference/verification.html) can check cycles, internal access, and declared dependencies. Match its module conventions and version to the application.

## Extract a service only when justified

Look for independent scaling, release cadence, security isolation, or team ownership strong enough to justify network failure and operational overhead. First remove cycles and make the module contract explicit. Plan data ownership, distributed consistency, observability, and failure recovery before moving the process boundary.

## References

- [Cockburn — hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture)
- [Spring Modulith — fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html)
- [Spring Modulith — structural verification](https://docs.spring.io/spring-modulith/reference/verification.html)

[^api]: Application Programming Interface — the contract through which software components interact.
[^jpms]: Java Platform Module System.
[^dto]: Data Transfer Object.
[^http]: Hypertext Transfer Protocol.
[^jdbc]: Java Database Connectivity.

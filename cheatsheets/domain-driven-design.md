# Domain-driven design cheat sheet

> Baseline: strategic and tactical DDD vocabulary; no framework or microservice topology is assumed. Reviewed: 2026-09-24.

DDD aligns software models with **business meaning and rules**. Start with the language people use to make decisions, then define where that language is valid.

Related: [object-oriented design](ood.md), [modular monoliths](modular-monoliths.md), [architecture styles](architecture-styles.md), [transactions](transactions-and-isolation.md), [messaging](messaging-and-events.md).

## Strategic vocabulary

| Term | Working meaning |
|------|-----------------|
| Domain | The area of activity being modeled |
| Subdomain | A distinct problem area within that domain |
| Core domain | The part where specialized capability differentiates the organization |
| Supporting subdomain | Necessary custom capability that is not the main differentiator |
| Generic subdomain | A broadly solved capability; evaluate reuse before custom investment |
| Ubiquitous language | Shared domain terms used in discussion, tests, and code within a context |
| Bounded context | Explicit boundary within which a model's terms and rules have consistent meaning |
| Context map | The relationships and translation agreements between contexts |

These are paraphrased working definitions, grounded in [Evans' DDD reference](https://www.domainlanguage.com/ddd/reference/). A bounded context, team, module, database, and deployment unit may align; they are not interchangeable definitions.

## Find a boundary from a disagreement

Illustrative geospatial example:

| Context | Meaning of “dataset” | Authority |
|---------|----------------------|-----------|
| Catalog | Published source, provenance, available versions | Publication metadata |
| Analysis | A project input fixed to a version and processing parameters | Reproducible analysis configuration |
| Delivery | A packaged result with export status and recipient | Export history |

Avoid a shared mutable `Dataset` entity whose fields mean different things in each context. Exchange explicit identifiers and contracts: for example, a catalog version identifier becomes part of an analysis input specification. A catalog rename need not rewrite the provenance of completed results. This is an illustrative modeling choice, not a claim about an existing application.

## Map the relationship

| Relationship | Use when | Cost |
|--------------|----------|------|
| Partnership | Both sides can coordinate changes closely | Scheduling and mutual dependency |
| Customer/supplier | Downstream needs can influence upstream plans | Requires a real prioritization agreement |
| Conformist | Downstream accepts an upstream model it cannot influence | Upstream concepts leak into local work |
| Anti-corruption layer | Local rules must stay independent of an external model | Translation, tests, and ongoing compatibility work |
| Shared kernel | A small model subset truly must be shared | Joint ownership and coordinated changes |
| Open host service / published language | Multiple consumers need a stable, understandable interface | Contract stewardship and versioning |
| Separate ways | Integration provides insufficient value | Deliberate duplication or manual handoff |

Upstream/downstream describes model influence, not necessarily the direction of a network call. An anti-corruption layer translates meaning as well as fields. See [bounded contexts](https://martinfowler.com/bliki/BoundedContext.html) and Evans' reference for context mapping.

## Tactical vocabulary

| Building block | Use | Avoid |
|----------------|-----|-------|
| Entity | Identity persists while attributes change | Defining equality from every mutable field |
| Value object | Meaning comes from its values; prefer immutability | Assigning arbitrary identity to a measurement |
| Aggregate / root | Boundary for rules that must remain consistent together; root controls changes | Loading an entire business domain as one object graph |
| Repository | Collection-like access to aggregate roots | One domain repository for every join table |
| Domain service | Domain operation that fits no single entity/value | A procedural dumping ground for all behavior |
| Application service | Coordinates a use case, transactions, and external interactions | Becoming the only home for business invariants |
| Domain event | A meaningful fact that has occurred | Assuming an in-memory notification is durable integration |

The tactical terms derive from [Evans' reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf). The implementation cautions here are practical guidance for this collection.

## Design aggregates from invariants

Example invariant: an analysis run may start only after its input versions and scoring parameters are frozen.

1. Model the state transition `draft → ready → running` and what each transition permits.
2. Protect the freeze/start rule with one authoritative transaction or concurrency check.
3. Reference large raster inputs by immutable version or content identity; do not make pixel data part of the aggregate object graph.
4. Record completion or failure through legal transitions. Reject stale updates with explicit version checks.
5. Publish durable integration facts only when the committed state and publication mechanism agree; an outbox can bridge that boundary.

Keep aggregates small enough to load and update for their invariants. A process spanning aggregates needs an explicit consistency policy: local coordination where appropriate, or asynchronous workflow and compensation where acceptable. Splitting an aggregate does not remove the underlying business rule.

## Domain events versus integration events

A domain event can be internal to one model. An integration event is an external contract with consumers, schema evolution, and delivery guarantees. Map internal facts to stable public messages instead of serializing JPA entities. Use event identifiers and consumer idempotency when delivery can repeat; see [messaging and events](messaging-and-events.md).

## When to stop modeling

Simple CRUD may need clear names, ownership, and validation without a rich domain model. Invest further when conflicting meanings, complex state transitions, or costly business mistakes justify it. DDD does not require event sourcing, CQRS, microservices, or a repository abstraction over every data access operation.

## References

- [Eric Evans — DDD reference and definitions](https://www.domainlanguage.com/ddd/reference/)
- [Eric Evans — DDD reference PDF](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
- [Martin Fowler — bounded context](https://martinfowler.com/bliki/BoundedContext.html)

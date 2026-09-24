# Architecture documentation with arc42 cheat sheet

> Baseline: arc42's 12-section structure, combined with C4 views and ADRs; suggested document placement is local guidance. Reviewed: 2026-09-24.

Architecture documentation should answer **what exists, why it exists, and what must remain true**. arc42 provides places for those answers; C4 supplies diagram vocabulary; ADRs retain decision rationale.

Related: [C4 diagrams](c4-diagrams.md), [Structurizr DSL](structurizr-dsl.md), [ADRs](architecture-decisions.md), [quality attributes](quality-attributes.md).

## arc42 section map

The section names follow the [arc42 overview](https://arc42.org/overview/). The suggested contents are a compact working interpretation for this collection.

| Section | Put here |
|---------|----------|
| 1. Introduction and goals | Stakeholders, purpose, most important quality goals |
| 2. Constraints | Fixed technology, delivery, organizational, or operating limits |
| 3. Context and scope | System boundary, external actors, interfaces, ownership |
| 4. Solution strategy | Main design choices and the requirements they address |
| 5. Building block view | Static decomposition and responsibility boundaries |
| 6. Runtime view | Significant success, failure, startup, and recovery scenarios |
| 7. Deployment view | Environment-specific infrastructure and instance mapping |
| 8. Crosscutting concepts | Common approaches to security, persistence, errors, configuration |
| 9. Architectural decisions | Links to current and superseded ADRs |
| 10. Quality requirements | Measurable usage and change scenarios |
| 11. Risks and technical debt | Known uncertainty, consequences, owners, and next actions |
| 12. Glossary | Domain terms and ambiguous technical vocabulary |

Use the sections that carry information. A small system can have one short document; a large one can link to several maintained sources.

## Combine arc42, C4, and ADRs

| Reader's question | Useful artifact | Likely arc42 home |
|-------------------|-----------------|-------------------|
| What is inside our responsibility? | C4 system context plus ownership notes | Context and scope |
| What are the major applications and stores? | C4 container view | Building block view |
| How does a difficult use case work? | Dynamic or UML sequence diagram | Runtime view |
| Where does this run in production? | C4 deployment view | Deployment view |
| Why was a worker extracted? | ADR plus measured constraints | Architectural decisions |
| How will we know the choice worked? | Quality scenario and evidence | Quality requirements |

This mapping is a practical convention, not a requirement that every arc42 section use C4. Building-block documentation may also need source/module structure that a container view does not show.

## Small useful documentation set

For an illustrative JavaFX analysis tool, start with:

- A context view naming the analyst, application responsibility, and external catalog.
- A container view distinguishing the desktop application, local database, and raster files.
- An import scenario describing cancellation and crashes between file writes and metadata commits.
- A workstation deployment view covering installation, project locations, backup, and offline behavior.
- An ADR explaining local data authority and a quality scenario that verifies offline editing.

Add a component view when an internal boundary is hard to understand or easy to violate. Add a glossary entry when two people use the same word differently.

## Keep one authoritative source per fact

| Fact | Preferred source | Documentation's role |
|------|------------------|----------------------|
| HTTP contract | Versioned OpenAPI and contract checks | Explain ownership and important semantics |
| Schema evolution | Migrations | Explain data authority and rollout constraints |
| Actual deployment settings | Deployment/configuration repository | Explain topology and intended failure boundaries |
| Dependency restrictions | Build or architecture verification rules | Explain why the restriction exists |
| Decision rationale | ADR | Link from the relevant view and implementation |

Generated views can reduce repetition, but a dependency graph cannot infer business ownership or why a design was chosen.

## Label time and certainty

Mark each view as current, proposed, or transitional. Record its scope, owner, review date, and source revision. In a migration, say which component owns each operation during each stage; two unlabeled diagrams do not describe a cutover plan.

Separate observed facts from assumptions. “Worker restart was verified by test X” is stronger than “the system is resilient.” For an unresolved risk, record the consequence, next evidence needed, and who will obtain it.

## Review triggers

Update the relevant documents when a change affects system boundaries, data authority, external contracts, deployment topology, quality budgets, or accepted ADRs. A release checklist should ask which architectural facts changed; a mandatory rewrite of every section adds little value.

## References

- [arc42 — template overview](https://arc42.org/overview/)
- [arc42 — documentation guidance](https://docs.arc42.org/)
- [C4 — diagram types](https://c4model.com/diagrams)
- [Michael Nygard — documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

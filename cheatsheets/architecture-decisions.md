# Architecture decision records cheat sheet

> Baseline: lightweight ADR practice informed by Nygard and MADR; repository conventions are recommendations. Reviewed: 2026-09-24.

An ADR preserves **a decision and the constraints that made it reasonable**. It lets a future engineer tell whether to keep the choice or revisit it.

Related: [architecture styles](architecture-styles.md), [quality attributes](quality-attributes.md), [arc42 documentation](architecture-documentation.md), [C4 diagrams](c4-diagrams.md).

## What deserves an ADR

| Decision | Usually record? | Reason |
|----------|-----------------|--------|
| System of record or data ownership | Yes | Shapes contracts and migration authority |
| Process/service boundary | Yes | Adds deployment and failure semantics |
| Cross-system consistency policy | Yes | Determines visible intermediate states and recovery |
| Major framework/storage adoption | Yes | Creates compatibility and operational commitments |
| Security or availability tradeoff | Yes | Needs explicit constraints and consequences |
| Local variable name or private helper | No | Code review normally carries enough context |
| Temporary incident workaround | Sometimes | Record lasting architectural consequences; link the incident |

The central structure is context, decision, status, and consequences. Preserve superseded decisions with links to replacements; do not erase the reason for an earlier design. See [Nygard's original ADR proposal](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Copyable template

Suggested filename: `decisions/NNNN-short-title.md`. Replace the bracketed prompts. This extends the basic ADR structure with evidence and revisit triggers, drawing on [MADR's decision-driver and option comparison approach](https://adr.github.io/madr/).

```markdown
# NNNN — [Concrete decision]

Status: Proposed
Date: YYYY-MM-DD
Decision owner: [Accountable role or team]

## Context

[Problem, existing system, hard constraints, and relevant quality scenarios.]

## Options

| Option | Benefit | Cost / risk |
|--------|---------|-------------|
| [Keep current design] | [Benefit] | [Cost] |
| [Alternative] | [Benefit] | [Cost] |

## Decision

We will [specific action and scope] because [decisive constraint or evidence].

## Consequences

[Benefits, accepted drawbacks, operational duties, and affected contracts.]

## Validation and rollout

[Evidence, remaining experiments, migration order, and rollback limits.]

## Revisit when

[Observable change that could invalidate the decision.]

## Links

[Requirements, diagrams, implementation, and related/replaced decisions.]
```

Do not leave placeholders in an accepted ADR. A proposed decision may explicitly identify an unknown and name the experiment needed to resolve it.

## Worked decision in miniature

Illustrative proposal, not an accepted decision for this repository:

| Field | Example |
|-------|---------|
| Title | Retain local project storage for offline analysis |
| Context | Analysts must open saved projects without network access; each project has one active writer |
| Options | Local SQLite plus files; remote database; local cache with synchronization |
| Decision | Retain local authoritative project storage because offline editing is required and shared editing is out of scope |
| Consequences | Simple offline access; explicit backup, file/database reconciliation, and schema-upgrade duties |
| Validation | Open and edit with network disabled; simulate interruption during import; restore a project backup |
| Revisit | Concurrent editing becomes a requirement, or projects exceed measured local capacity |

The useful part is the condition “one active writer.” “SQLite is lightweight” alone would not explain why the choice is defensible.

## Lifecycle and review

Suggested lifecycle: proposed → accepted, or proposed → rejected. An accepted decision can later be deprecated or superseded by a new record. Link the successor from the old record and the predecessor from the new one.

- Review with the people who own affected code, contracts, data, and operations.
- Separate acceptance from implementation status. An accepted ADR is not proof that rollout completed.
- Amend factual errors transparently; use a new ADR for a materially different choice.
- Keep comparisons fair. Include the current design and the strongest realistic alternative.
- Link evidence rather than inventing precise cost or performance numbers.
- Record what would change the choice. “Never revisit” is rarely justified.

## Review questions

Can a reader identify the action, boundary, decisive constraint, rejected alternative, and accepted downside? Can they find the validation evidence and the current status? If not, shorten background prose and make those facts explicit.

## References

- [Michael Nygard — documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [MADR — Markdown Architectural Decision Records](https://adr.github.io/madr/)

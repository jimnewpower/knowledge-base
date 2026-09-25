# Agent skills development cheat sheet

> Baseline: Agent Skills open format as reviewed on 2026-09-25; discovery, installation, tool permissions, and invocation remain runtime-specific. Reviewed: 2026-09-25.

Use this when a recurring task needs reusable instructions, supporting references, or deterministic helper scripts. A skill packages a procedure; it does not train model weights or grant access by itself.

Related: [prompt engineering](prompt-engineering.md), [context engineering](context-engineering.md), [MCP](mcp.md)[^mcp], [AI evaluation](ai-evaluation.md)[^ai].

## Choose the right home

| Need | Prefer |
|------|--------|
| One request with temporary constraints | Task prompt |
| Rules that apply throughout a repository | Runtime-supported project instructions |
| Repeatable specialized procedure | Skill |
| Reliable parsing or transformation | Tested helper program, optionally called by a skill |
| Connection to a service | Tool or MCP server |

Keep a skill narrow enough to have recognizable triggers and observable success. “Help with software” cannot be evaluated as precisely as “review a database migration for rollout compatibility.”

## Portable structure

```text
migration-review/
  SKILL.md
  references/
    review-checklist.md
  scripts/
    inspect-migration.py
  assets/
    report-template.md
```

Only `SKILL.md` is required. Its YAML[^yaml] front matter includes `name` and `description`. The name must match its directory, use lowercase letters/numbers/hyphens, have no consecutive or leading/trailing hyphens, and fit within 64 characters. The nonempty description is limited to 1,024 characters and should explain behavior and activation conditions.

Metadata supports discovery; the body loads on activation; referenced resources load as needed. Keep detailed reference material outside the core procedure.

## Minimal skill example

Complete illustrative `migration-review/SKILL.md`; installation and discovery are host-specific. It performs a review, not a migration.

```markdown
---
name: migration-review
description: Review database migrations for rollout compatibility and recovery. Use when reviewing a proposed schema migration; exclude routine query tuning.
---

# Migration review

Read the migration, database version, and affected application queries.
Identify assumptions that cannot be resolved from the supplied files.
Check old/new application overlap, locks, backfills, and failure recovery.
Return findings with file locations, failure scenarios, and suggested checks.
Do not execute migrations as part of this review.
```

## Authoring loop

1. Collect real requests that should and should not activate the skill.
2. Describe its scope, required inputs, output contract, and verification steps.
3. Put stable procedures in the body; put detailed references and templates in separate files with explicit relative links.
4. Use scripts for operations where repeatability matters. Document dependencies, inputs, outputs, and side effects.
5. Exercise the skill in its actual host with normal, ambiguous, and incomplete requests.
6. Review activation mistakes and result quality separately; version the skill alongside its fixtures.

## Verification matrix

| Case | Expected behavior |
|------|-------------------|
| Matching task | Activates and follows the output contract |
| Nearby but excluded task | Does not hijack unrelated work |
| Missing prerequisite | Reports the specific missing input |
| Helper failure | Surfaces the error rather than claiming success |
| Malicious reference text | Preserves the trusted task and permission boundary |
| Repeated execution | Avoids duplicate writes or documents its repeat behavior |

Review installed skills and bundled scripts as executable supply-chain inputs. The experimental `allowed-tools` field has varying host support; never rely on it as a portable security sandbox.

## References

- [Agent Skills — format specification](https://agentskills.io/specification)
- [Agent Skills — integration guidance](https://agentskills.io/integrate-skills)

[^mcp]: Model Context Protocol.
[^ai]: Artificial Intelligence.
[^yaml]: YAML Ain't Markup Language — the structured format used for skill metadata.

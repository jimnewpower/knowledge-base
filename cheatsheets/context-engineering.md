# Context engineering cheat sheet

> Baseline: Provider-neutral language-model context, retrieval, and durable task-state design. Reviewed: 2026-09-25.

Use this when an assistant has good instructions but lacks the right evidence, loses constraints over time, or acts on stale information.

Related: [prompt engineering](prompt-engineering.md), [RAG](rag.md)[^rag], [skills development](agent-skills-development.md), [AI security](ai-security.md)[^ai].

## Decide what belongs where

| Layer | Store | Refresh policy |
|-------|-------|----------------|
| Standing instructions | Stable project conventions and boundaries | Review when the project changes |
| Current task | Goal, acceptance criteria, authorized scope | Update when the user redirects work |
| Working evidence | Relevant files, tool observations, source excerpts | Re-read after edits or external changes |
| Task checkpoint | Decisions, completed work, unresolved questions, next step | Save before handoff or compaction |
| Durable knowledge | Verified reusable facts with sources and scope | Assign an owner and revisit trigger |

The context window is bounded; useful attention is not guaranteed for every supplied token. Selection and freshness matter even when everything fits.

## Build the context deliberately

1. Search an index or symbol map before opening large files.
2. Read the owning implementation, its contract, and the test that exercises it.
3. Preserve source paths, revisions, timestamps, and permissions alongside excerpts.
4. Keep trusted instructions distinguishable from retrieved data and tool output.
5. Bound large results with pagination or focused extracts; say what was omitted.
6. Re-read authoritative state before an action that depends on it.

Reserve room for the next tool result and the final response. Count tool schemas, history, images, and runtime overhead where the provider's accounting includes them; a character count is only an estimate.

## Checkpoint example

Illustrative handoff note; store sensitive state only in an approved location.

```text
Goal: reject negative order quantities; preserve zero behavior.
Scope: OrderService and its tests; no persistence schema changes.
Done: added regression test; confirmed it fails on the original code.
Current state: implementation changed; focused tests pass.
Evidence: owning module test report; source revision recorded separately.
Open: full module verification has not run.
Next: run module verification, inspect diff, report results.
Omitted: unrelated passing test output and earlier rejected approaches.
```

A checkpoint is a navigation aid. It should not silently replace source code, test output, or the user's latest instruction.

## Failure diagnosis

| Symptom | Likely check |
|---------|--------------|
| Correct answer for an older revision | Stale excerpt, cache, or checkpoint |
| Important constraint disappears | Compaction omitted it; competing copies disagree |
| Retrieved text redirects the task | Data was promoted into instruction authority |
| Growing cost with no better answers | Repeated history or irrelevant tool results |
| Cross-user facts appear | Memory/cache isolation and retrieval permissions |

Treat memory writes as data changes: validate facts, keep provenance, support deletion, and isolate users and tenants. Do not store an unverified model conclusion as established project truth.

## References

- [Anthropic — effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OWASP — prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)[^owasp]

[^rag]: Retrieval-Augmented Generation — retrieve external evidence and provide it to a model while generating a response.
[^ai]: Artificial Intelligence.
[^owasp]: Open Worldwide Application Security Project.

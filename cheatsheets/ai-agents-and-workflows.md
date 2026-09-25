# AI[^ai] agents and workflows cheat sheet

> Baseline: Provider-neutral orchestration patterns for language models and tools; examples are conceptual control flow. Reviewed: 2026-09-25.

Use this to decide how much autonomy a task needs and where application code must enforce limits.

Related: [AI-assisted development](ai-assisted-development.md), [MCP](mcp.md)[^mcp], [skills](agent-skills-development.md), [evaluation](ai-evaluation.md), [resilience](resilience.md).

## Select the simplest adequate control flow

| Shape | Who chooses the steps? | Useful for |
|-------|------------------------|------------|
| Single model call | Application specifies one task | Classification or bounded extraction |
| Workflow | Application fixes the route or branches | Repeatable review or document processing |
| Agent | Model selects the next action from allowed tools | Investigation where needed steps emerge from observations |
| Multiple agents | Coordinator partitions bounded responsibilities | Independent research or checks with clear integration rules |

Autonomy adds tool errors, extra latency, and more possible execution paths. Start with a workflow when the process is known. Add agents when adaptive decisions measurably improve task completion.

## Bounded agent loop

Pseudocode, not an executable implementation:

```text
load goal, authorized scope, current state, and budgets
repeat until complete, blocked, cancelled, or budget exhausted:
    select proposed action using current evidence
    validate action schema, permission, and remaining budget
    execute with deadline and bounded output
    record result and any durable state change
    verify progress; update evidence or stop on repeated failure
return outcome, evidence, and incomplete work
```

The application enforces tool access, destinations, time limits, spend limits, and required approval. A sentence in a prompt is not enforcement.

## Tool contract checklist

| Contract part | Why it matters |
|---------------|----------------|
| Specific name and description | Reduces selection ambiguity |
| Typed, bounded arguments | Prevents unconstrained queries and malformed requests |
| Explicit effects | Distinguishes inspection from mutation |
| Stable result/error structure | Allows recovery without guessing |
| Pagination and output limits | Keeps observations usable in context |
| Idempotency and operation status | Resolves uncertain outcomes without duplicate writes |

If a write times out, the operation may have succeeded. Query its status or use an idempotency key before retrying. Cancellation does not imply rollback.

## Checkpoints and handoffs

Persist the task goal, accepted constraints, evidence locations, completed operations, and next unresolved step. Keep credentials out of transcripts. After restart, reconcile external state before continuing a previously attempted mutation.

For multiple agents, assign explicit file or task ownership, pass only needed context, and designate who integrates results. Independent workers can still share a faulty premise; agreement is not independent verification.

## Failure cases worth testing

- Tool returns an empty result, partial data, or a schema error.
- External write succeeds but its response is lost.
- Repeated attempts make no progress.
- Source content contains instructions to redirect tools.
- Budget expires before verification finishes.
- User changes the goal while a tool call is in flight.

Judge the final state and prohibited side effects as well as the response text. An agent that says “done” without producing the requested artifact has not completed the task.

## References

- [Anthropic — building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic — evaluation of agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

[^ai]: Artificial Intelligence.
[^mcp]: Model Context Protocol.

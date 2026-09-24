# AI prompt and context engineering cheat sheet

Working with language models as part of software engineering: writing instructions, feeding the right context, and keeping generated work reviewable.

This is engineering of *inputs and memory*, not a substitute for tests or design judgment.

## Terms

| Term | Meaning |
|------|---------|
| Prompt | The instruction for this turn |
| System / standing instructions | Durable rules that should apply every turn |
| Context | Everything the model can see: instructions, files, prior turns, tool results |
| Context window | Hard cap on that context |
| Grounding | Forcing answers to cite retrieved or attached sources |
| Tool use | The model calls functions instead of guessing |
| Agent | A loop: model → tools → observation → model |

## Prompt structure that holds up

Write prompts like runbooks, not poems.

1. **Role and mission** — what kind of work, what “done” means
2. **Constraints** — stack, style, what not to touch
3. **Inputs** — files, APIs, error text; attach them, do not summarize from memory if the file exists
4. **Procedure** — steps, order, when to ask vs when to act
5. **Output contract** — format, filename, tests expected
6. **Uncertainty rule** — say so; do not invent APIs or internals

Example skeleton:

```markdown
You are helping on the order-service (Java 21, Spring Boot, Maven).

Goal: add cursor pagination to GET /orders without breaking v1 clients.

Constraints:
- Do not change the database schema in this change.
- Follow existing ErrorBody JSON.

Do: read OrderController and OrderQueryService first.
Output: patch + a JUnit test for the next-cursor header.
If the current contract already has a page field, stop and report.
```

## Context engineering

The scarce resource is the window, not clever wording.

| Put in context | Leave out |
|----------------|-----------|
| The file being edited and its close neighbors | The entire monorepo |
| Interface + one implementation | Generated code, lockfiles, `target/` |
| Failing test and stack trace | Ten similar passing tests |
| ADR that constrains the change | Marketing PDF about the domain |
| Command output you just ran | Recited man pages the model already knows |

Tactics:

- **Index then read.** Search for the symbol, open the two files that own it.
- **Layer memory.** Standing project rules in one short file; task details in the prompt; durable facts in project memory or this knowledge base.
- **Refresh after edits.** Stale file excerpts cause the model to patch ghosts.
- **One source of truth.** Do not paste two conflicting copies of the same interface.
- **Summarize with loss labeled.** If you compress a 2,000-line class, say what you dropped.

## Context budgets (practical)

```text
standing instructions     small, stable
task prompt               small, specific
retrieved files           the bulk of the budget
tool traces               keep the last relevant ones
chat history              prune or start a new thread when the task changes
```

When the model starts contradicting a file you already showed it, the window is polluted. Start a fresh thread with a clean file set.

## Patterns

| Pattern | Use |
|---------|-----|
| Ask for a plan, then approve, then implement | Risky refactors |
| Tests first | Behavior changes — see [tdd.md](tdd.md) |
| Diff-constrained | “Touch only these paths” |
| Rubric critique | “Review this diff against the ADR” |
| Grounded extract | “Quote the method; do not paraphrase signatures” |
| Delegation | Researcher gathers sources; implementer patches; reviewer checks |

## Failure modes

- **Hallucinated APIs** — inventing Spring annotations or Maven coordinates. Require compile/test.
- **Scope creep** — reformatting the module while adding a flag. Constrain paths.
- **Lost constraints** — long threads forget the Java version. Repeat standing rules in the repo (`AGENTS.md`, this knowledge base).
- **Secret leakage** — never paste tokens, `.env`, or production dumps into a prompt.
- **Unverified compounding** — filing a wrong note into the knowledge base trains the next session to be wrong. People own the truth.

## Repo conventions that help agents

- Short `AGENTS.md` / project instructions at the root of a product repo
- This knowledge base for durable engineering judgment
- ADRs for decisions that should survive a new chat
- Commands the agent can actually run (Maven, tests) instead of “looks good”

## Gotchas

- More context is not more accuracy past the relevant set.
- “You are an expert” adds almost nothing; constraints and files add a lot.
- Temperature and sampling matter more for prose than for code. For code, deterministic loops + tests beat sampling tricks.

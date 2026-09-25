# AI[^ai]-assisted development cheat sheet

> Baseline: Provider-neutral coding assistants and tool-using agents; Java 21 / Maven examples are task instructions, not executable applications. Reviewed: 2026-09-25.

Use this when delegating implementation, debugging, review, or documentation while keeping responsibility for the resulting software.

Related: [prompt engineering](prompt-engineering.md), [context engineering](context-engineering.md), [agent workflows](ai-agents-and-workflows.md), [testing](testing.md), [Git](git.md).

## Choose a bounded task

| Task | Supply | Require as evidence |
|------|--------|---------------------|
| Fix a bug | Reproduction, expected behavior, failing test | Regression test that fails before the fix |
| Add behavior | Acceptance criteria, existing contract, owning files | Focused diff and relevant passing checks |
| Explain code | Entry point, exact revision, question | File and symbol references; uncertainty called out |
| Review a change | Diff, design constraints, risk areas | Concrete failure scenario and location per finding |
| Update dependencies | Current/target versions and compatibility constraints | Official migration guidance, build and integration checks |

Prefer tasks whose completion can be checked independently. “Improve this codebase” has no useful stopping condition.

## Development loop

1. **Inspect:** check the working tree, repository instructions, owning code, and nearby tests. Identify existing user changes.
2. **Specify:** state expected behavior, exclusions, and verification commands. Resolve ambiguity that changes the contract.
3. **Implement:** make a reviewable change in an isolated branch or worktree when concurrent work warrants it.
4. **Verify:** inspect the diff and run the checks that prove the behavior. Check referenced library APIs[^api] against the deployed version.
5. **Review:** look for permission changes, broken contracts, error handling, concurrency, and unintended edits.
6. **Close out:** report what changed, checks actually run, and remaining limitations. Publishing or deployment follows the project's authorization policy.

## Copyable task brief

Illustrative prompt; replace file names and behavior with the actual repository contract.

```text
Goal: reject a negative quantity in OrderService before persistence.
Baseline: Java 21, Maven, existing JUnit tests.
Read: repository instructions, OrderService, and OrderServiceTest.
Preserve: public signatures and unrelated working-tree changes.
Acceptance: zero is allowed; negative input throws IllegalArgumentException;
the repository is not called for rejected input.
Verify: add the regression case and run the owning module's tests.
Deliver: focused diff, commands/results, and any unverified assumptions.
```

## Review the evidence

- A passing test generated from a mistaken assumption still proves the wrong contract. Derive assertions from requirements and include boundary cases.
- Compilation catches invented signatures, not incorrect business rules. Integration tests exercise real persistence and framework behavior.
- Treat a second model's review as another signal. It does not replace independent checks or accountable human review.
- Keep credentials and private data out of prompts and fixtures; use authorized, minimized examples.
- Check new dependencies for provenance and fit before accepting an assistant's suggestion.

## Troubleshooting

| Symptom | Next action |
|---------|-------------|
| Agent repeatedly edits the wrong layer | Provide the actual call path and owning module |
| Tests pass but the bug remains | Reproduce through the affected boundary; inspect the test's setup and assertions |
| Large unrelated diff | Tighten acceptance criteria and review the intended files before continuing |
| “Verified” with no results | Ask for exact commands, exit status, and what was not run |
| Parallel edits overwrite work | Separate ownership or worktrees; reconcile the diff before integration |

## References

- [Anthropic — building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OWASP — prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)[^owasp]

[^ai]: Artificial Intelligence.
[^api]: Application Programming Interface — the callable contract exposed by a library or service.
[^owasp]: Open Worldwide Application Security Project.

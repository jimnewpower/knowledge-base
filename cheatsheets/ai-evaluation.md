# AI[^ai] evaluation cheat sheet

> Baseline: Provider-neutral evaluation of generated answers, retrieval, and tool-using agents; illustrative fixtures and metrics. Reviewed: 2026-09-25.

Use this before changing a model, prompt, retrieval pipeline, skill, or agent policy. Evaluation turns “looks better” into an explicit comparison against the task contract.

Related: [testing](testing.md), [RAG](rag.md)[^rag], [agents](ai-agents-and-workflows.md), [security](ai-security.md), [observability](observability.md).

## Separate the layers

| Layer | Question | Evidence |
|-------|----------|----------|
| Retrieval | Did the needed evidence arrive? | Labeled relevant passages among retrieved candidates |
| Answer | Is it correct, supported, and useful? | Task-specific rubric and source checks |
| Structure | Can the consumer parse and validate it? | Schema and business-rule validation |
| Tool behavior | Were the right operations authorized and executed? | Tool trace and resulting state |
| End-to-end | Did the user's task succeed within limits? | Artifact/state checks, latency, cost, side effects |

## Build a small useful evaluation set

1. Sample ordinary requests from the intended audience with appropriate data permissions.
2. Add boundaries: no answer, conflicting evidence, long input, wrong version, and tool failures.
3. Include adversarial content and attempts to access another user's data.
4. Record expected behavior and unacceptable outcomes before running the candidate.
5. Keep a held-out set separate from examples used to tune prompts or train models.

Version datasets, rubrics, prompts, model identifiers, tool implementations, and source corpora together. Preserve enough trace evidence to diagnose failures without retaining unnecessary private data.

## Example fixture

Complete illustrative JSON[^json] fixture; these fields describe a test contract, not a particular evaluation framework.

```json validate
{
  "case": "unsupported-version",
  "question": "Is feature X available in release 4?",
  "evidence": "Feature X is documented for release 3 only.",
  "required": ["report insufficient evidence for release 4"],
  "forbidden": ["claim release 4 support", "invent a citation"]
}
```

## Grading methods

| Grader | Good fit | Limitation |
|--------|----------|------------|
| Deterministic assertion | Output schema, calculation, file, database state | Exact text matching can reject valid wording |
| Human review | Nuanced utility, ambiguity, domain correctness | Cost and reviewer inconsistency |
| Model judge | Scalable rubric-based comparison | Bias, inconsistency, susceptibility to the evaluated text |

Calibrate model judges against human-labeled examples. Keep their instructions separate from the answer under evaluation; test whether answer text can manipulate the grader. Do not let a model's self-rating be the sole acceptance criterion.

## Metrics that answer different questions

- **Task success rate:** successful tasks / evaluated tasks under a defined rubric.
- **Recall at k:** relevant items retrieved in the first k / all labeled relevant items, averaged using a stated method.
- **Precision at k:** relevant items in the first k / k, with an explicit policy for fewer returned items.
- **Supported-claim rate:** checked factual claims supported by the supplied evidence / checked factual claims.
- **Operational measures:** latency distribution, token/tool cost, failure rate, retries, and prohibited actions.

Report sample size, task categories, and uncertainty; averages can hide critical failures. For nondeterministic systems, repeat representative cases and distinguish “succeeded once in several attempts” from “usually succeeds on the first attempt.”

## Release decision

Choose acceptance thresholds based on the task's consequences before comparing candidates. Inspect regressions and failure clusters, not just the aggregate score. Keep a rollback path and monitor production behavior because offline inputs cannot cover every future request.

## References

- [Anthropic — demystifying evaluations for agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Stanford information retrieval book — evaluation](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-in-information-retrieval-1.html)

[^ai]: Artificial Intelligence.
[^rag]: Retrieval-Augmented Generation.
[^json]: JavaScript Object Notation.

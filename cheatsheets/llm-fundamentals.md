# LLM[^llm] fundamentals cheat sheet

> Baseline: Conceptual reference for transformer-based generative language models; no provider-specific model sizes, pricing, or limits assumed. Reviewed: 2026-09-25.

Use this to understand the components and limitations behind an AI[^ai] application before choosing retrieval, tools, or model adaptation.

Related: [prompt engineering](prompt-engineering.md), [embeddings](embeddings-and-vector-search.md), [RAG](rag.md)[^rag], [agents](ai-agents-and-workflows.md), [evaluation](ai-evaluation.md).

## Working vocabulary

| Term | Practical meaning |
|------|-------------------|
| Token | Model-specific unit of encoded input or output; not necessarily a word |
| Tokenizer | Converts text into token identifiers and back |
| Inference | Running a trained model to produce output |
| Autoregressive generation | Predicting successive tokens conditioned on earlier context |
| Context window | Bounded sequence available to the model; accounting varies by runtime |
| Parameters / weights | Learned numeric values; ordinary conversation does not directly update them |
| Embedding | Numeric representation used for similarity or other downstream tasks |
| Hallucination | Plausible-looking output that is unsupported or false |
| Grounding | Supplying evidence that constrains an answer; still requires verification |
| Multimodal model | Accepts or generates more than text, such as images or audio |

A chat application's history, retrieval, memory, and tools are surrounding software. Do not infer their capabilities from the base model alone.

## Choose the intervention

| Need | First approach to consider | Limitation |
|------|----------------------------|------------|
| Clearer task behavior | Improve instructions and examples | Cannot supply missing current facts |
| Current/private source knowledge | Retrieve authorized evidence | Retrieval and source quality can fail |
| Exact calculation or live state | Call a suitable tool | Tool permissions and failures need handling |
| Repeated specialized behavior | Evaluate fine-tuning on curated examples | Training cost, regression risk, data governance |
| Reliable arithmetic or business rules | Deterministic application code | Requires an explicit contract |

Fine-tuning changes weights; retrieval supplies information at inference time. Neither makes every answer correct. Start with a measured baseline before adding complexity.

## Generation controls

- **Output limit:** bound generation and handle truncation explicitly; a partial object is not a valid result.
- **Temperature:** adjusts sampling distribution where supported. Lower values do not guarantee correctness or identical reruns.
- **Top-p:** restricts sampling to a probability mass where supported; it is not a confidence score.
- **Stop conditions:** end generation under configured conditions; check that required content was produced.
- **Structured output:** constrains shape where supported; business validation remains necessary.

Record the exact model and settings used in comparisons. Supported controls and defaults differ, including for models that perform additional reasoning before returning an answer.

## Operational questions

Before adopting a model, measure representative task quality, latency, token usage, failure handling, supported modalities, and data-handling requirements. Check actual deployment limits rather than copying a generic token-to-word ratio.

Illustrative planning equation, not a provider billing contract:

```text
request cost ≈ billed input tokens × input rate
             + billed output tokens × output rate
             + applicable tool, storage, and retrieval charges
```

Caching, reasoning-token accounting, and batch rates can change that calculation. A short answer may still involve substantial internal work or tool activity.

## References

- [Hugging Face Transformers — text generation](https://huggingface.co/docs/transformers/llm_tutorial)
- [Hugging Face course — tokenizers](https://huggingface.co/learn/llm-course/en/chapter2/4)
- [Vaswani et al. — Attention Is All You Need](https://arxiv.org/abs/1706.03762)

[^llm]: Large Language Model — a trained model that processes and generates language.
[^ai]: Artificial Intelligence.
[^rag]: Retrieval-Augmented Generation.

# RAG[^rag] cheat sheet

> Baseline: Provider-neutral retrieval-augmented generation over permissioned document collections; conceptual pipeline rather than a framework implementation. Reviewed: 2026-09-25.

Use this when generated answers need current, private, or attributable source material beyond the model's learned weights.

Related: [embeddings and vector search](embeddings-and-vector-search.md), [context engineering](context-engineering.md), [evaluation](ai-evaluation.md), [authorization](authorization.md).

## Two pipelines to own

```text
Ingestion: source -> parse -> chunk -> attach metadata -> index
Answering: question -> authorized retrieval -> rerank -> evidence -> answer -> verify
```

Vector search is optional. Keyword, relational, graph, or hybrid retrieval can supply evidence. Choose retrieval based on the questions and corpus rather than the label of a database.

## Make evidence usable

| Decision | Practical starting point | Failure to watch |
|----------|--------------------------|------------------|
| Parsing | Preserve headings, tables, code, and source locations | Flattened tables change meaning |
| Chunking | Group coherent sections within model limits | Split qualifiers, missing units, orphaned code |
| Metadata | Source, revision, location, tenant, access policy | Untraceable or unauthorized answers |
| Retrieval | Compare lexical and semantic baselines | Exact identifiers lost in semantic matches |
| Reranking | Reorder a bounded candidate set | Extra latency with no measured relevance gain |
| Context assembly | Deduplicate and fit relevant evidence to budget | Repetition crowds out the needed passage |
| Citation | Map claims to source locations actually retrieved | A real link that does not support the claim |

There is no universal chunk size or number of passages. Tune against representative questions, including questions that need more than one section.

## Permission and freshness contract

- Apply the caller's permissions before evidence reaches the model. Make candidate retrieval permission-aware; recheck authorization before exposure when state may have changed.
- Propagate updates, deletions, and revoked access to derived indexes and caches. Track lag and define what happens while an update is pending.
- Keep document and chunk identities stable enough to reconcile updates. Record the embedding model and index version.
- Treat retrieved text as untrusted data. A document can support a factual answer without authorizing an action.
- Include tenant, access scope, and relevant source versions in cache design; never reuse a private answer for an unauthorized caller.

## Grounded-answer example

Illustrative output contract for a documentation assistant:

```text
Question: Which library versions does release 4 support?
Evidence: release-4/support.md, revision abc123, section Dependencies.
Answer: summarize only versions supported by that evidence.
If the source covers release 3 only, report the mismatch.
If two release-4 sources disagree, identify the conflict and their revisions.
```

If retrieval finds nothing reliable, report insufficient evidence or ask for the missing source. A fluent fallback from model memory defeats an evidence-only contract.

## Diagnose retrieval separately from generation

| Failure | Investigate |
|---------|-------------|
| Relevant passage absent from candidates | Parsing, filters, query, index freshness, retrieval recall |
| Passage retrieved but omitted from prompt | Reranking, deduplication, context budget |
| Passage present but answer wrong | Instructions, interpretation, model capability |
| Answer right but source citation wrong | Claim-to-source mapping and citation validation |

Measure retrieval recall on labeled questions, supported-answer quality, abstention behavior, latency, and cost. Do not use answer fluency as a proxy for retrieval quality.

## References

- [Microsoft — retrieval-augmented generation overview](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview)
- [Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)[^nlp]
- [Sentence Transformers — semantic search](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)

[^rag]: Retrieval-Augmented Generation — retrieving external evidence to inform a generated response.
[^nlp]: Natural Language Processing — computational processing of human language.

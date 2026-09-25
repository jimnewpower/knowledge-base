# Embeddings and vector search cheat sheet

> Baseline: Conceptual dense retrieval and hybrid search; similarity metrics, dimensions, and query/document encoding depend on the embedding model. Reviewed: 2026-09-25.

Use this to design or troubleshoot semantic retrieval. An embedding maps content into a numeric vector; nearby vectors may indicate relevance under the model's training objective.

Related: [RAG](rag.md)[^rag], [model fundamentals](llm-fundamentals.md), [evaluation](ai-evaluation.md), [data structures](data-structures.md).

## Choose the search behavior

| Approach | Strength | Limitation |
|----------|----------|------------|
| Lexical search | Exact names, identifiers, and rare terms | Paraphrases may share no words |
| Dense vector search | Semantic similarity and paraphrases | Similar wording can hide incompatible meaning |
| Hybrid retrieval | Combines lexical and vector candidates | Needs rank fusion and evaluation |
| Reranking | Scores query/document pairs more carefully | Additional computation per candidate |

Use rank-based fusion or calibrated scores when combining retrieval systems. Raw lexical scores and vector distances are not automatically comparable.

## Similarity basics

For nonzero vectors, cosine similarity is their dot product divided by the product of their lengths. It compares direction. Dot product also depends on magnitude; Euclidean distance measures separation. With unit-normalized vectors, their rankings are related, but follow the model's documented metric and normalization.

Similarity is not a calibrated probability that a passage answers the question. Choose thresholds using labeled examples, including irrelevant and deceptively similar passages.

## Index contract

- Encode queries and documents with compatible versions of the same model family and the required query/document instructions.
- Equal vector dimensions do not make two embedding spaces compatible. A model change usually requires re-embedding the corpus.
- Record model version, dimensions, normalization, chunking policy, and source revision with the index build.
- Start with exact search when feasible. Approximate nearest neighbor search trades recall for speed and memory; compare it to an exact baseline.
- Evaluate metadata filtering with realistic permissions and tenant sizes. A fast global search can still fail on selective filters.
- Budget for source text and metadata as well as vectors; retain authoritative sources for citations and reindexing.

## Example retrieval experiment

Illustrative test design for a developer knowledge base:

```text
Query A: "HikariCP maximumPoolSize"     -> exact-name behavior
Query B: "threads waiting for a connection" -> paraphrase behavior
Query C: "connection pool exhausted"   -> diagnosis behavior
Query D: unrelated gardening question   -> no useful match expected

Compare: lexical only, vector only, hybrid, hybrid plus reranking.
Hold constant: corpus revision, permissions, and answer-generation model.
Record: relevant passages found, ordering, latency, and indexing cost.
```

Inspect misses before increasing the candidate count. Truncated documents, stale chunks, incorrect query encoding, and an unsuitable model can all resemble a search-tuning problem.

## References

- [Sentence Transformers — semantic search](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)
- [pgvector — distances, exact search, and approximate indexes](https://github.com/pgvector/pgvector)
- [Microsoft — hybrid search and reciprocal rank fusion](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking)

[^rag]: Retrieval-Augmented Generation.

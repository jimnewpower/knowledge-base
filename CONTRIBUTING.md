# Contributing to the knowledge base

Improve a public engineering reference with original explanations, accurate examples, and useful connections. Keep project decisions, private context, and product plans in their own repositories.

## Report a correction or missing topic

Open an [issue](https://github.com/jimnewpower/knowledge-base/issues) with the page/link, passage or unanswered question, relevant version, and a primary source or minimal reproduction. For search problems, include the exact query and the page you expected to find. Do not include credentials, customer data, or private logs.

## Add or revise a reference

1. Search existing sheets and [reading paths](guides/start-here.md). Extend existing coverage when it answers the same question.
2. Use a unique descriptive H1, a short purpose or “Use this when” paragraph, related links, practical guidance, failure cases, and primary references.
3. Every sheet needs `> Baseline: ... Reviewed: YYYY-MM-DD.` with exact relevant technology versions or a clearly scoped conceptual baseline. Update the date after technical/editorial review, not just formatting.
4. Explain prerequisites beside examples. Distinguish complete examples from fragments; do not claim a sketch is runnable.
5. Add the page and a “Use this for” summary to [the index](cheatsheets/README.md) and exactly one primary category in `app/src/data/categories.ts`. Guides also need a primary category. Root/index documents are navigation documents and are exempt.
6. Add related links from relevant existing sheets. Use category entry points to distinguish concepts from implementation. Add discovery terms to `app/src/data/search-aliases.ts` only when they help readers find relevant content.
7. Cite official versioned documentation where possible. State assumptions and label recommendations. Do not reproduce licensed manuals or invent measurements.

## Validate the change

Run from `app/` after `npm ci`:

```bash
npm run check:content
npm test
npm run build
```

The content gate checks unique titles, required sheet metadata, primary references, local file/heading links, index coverage, category ownership, and opted-in complete JSON/YAML/XML examples. Reader tests include representative search queries. CI runs these checks for pull requests and pushes.

For a complete JSON/YAML/XML code fence, append `validate` to its language (for example, `xml validate`). This opts it into parsing; it does not prove schema validity, framework startup, or business behavior. Leave fragments unmarked and label them as fragments in prose. The checker rejects unsupported validation languages rather than silently skipping them. Ten existing complete examples are opted in, including OpenAPI/JSON Schema, event/error payloads, CI configurations, Collector configuration, and Log4j XML.

For executable examples, add focused tests under `app/src/server/content-examples.test.ts` or a suitable consuming-stack harness. The React and Intl examples demonstrate extracting the actual Markdown example for type/behavior checks. Never execute arbitrary shell fences automatically.

In the PR, record the files/examples checked, tool/runtime versions, exact commands, and any manual-only checks. Separate “source reviewed,” “syntax parsed,” “type-checked,” and “behavior tested.” A review date alone is not execution evidence.

## References and freshness

Run `npm run check:links` for remote-link checks. It follows HTTPS/HTTP links from prose, excludes code examples and loopback URLs, and reports inaccessible destinations with their referring pages. Authentication, rate limits, and bot restrictions need manual review; a failed fetch is not proof that the cited claim is false. Weekly and manually dispatched CI runs check remote links separately from the deterministic PR gate.

When a dependency or specification changes, review affected baselines and cross-links. Preserve accurate older-version guidance when it remains useful; label it instead of silently mixing versions. Do not bump dates without reviewing the affected claims.

## Review checklist

- Can a public reader understand the purpose without project context?
- Does the summary explain when this page helps, and how it differs from nearby pages?
- Do examples declare prerequisites and verification limits?
- Do links, category navigation, and representative searches reach the page?
- Does the PR state what was verified and what remains an illustrative fragment?

# Software Engineering Knowledge Base

A public, searchable software engineering reference: concise explanations, practical examples, tradeoffs, and troubleshooting guidance. Use it to look up a concept, compare approaches, or find implementation details.

The collection serves developers and architects across languages and platforms. Java has substantial coverage, alongside web development, data, security, integration, testing, delivery, and geospatial software libraries.

## Find what you need

- [Browse all cheat sheets](cheatsheets/README.md) for topic summaries.
- [Start with a reading path](guides/start-here.md) to distinguish concepts from implementation.
- Use the reader's ten categories, topic filters, related links, and full-text search.
- Search by concept, API, command, or acronym: `virtual threads`, `rebase`, `JPA`, `a11y`, or `i18n`. Prefixes, common aliases, limited typo tolerance, and a category filter help narrow results.

## Scope

References cover languages, browser fundamentals, application architecture, APIs, integration, persistence, security, testing, delivery, operations, and AI. The AI category covers assisted development, model fundamentals, prompting, context, retrieval, tools, skills, evaluation, and security. Specialized technologies are welcome when the explanation is reusable across projects.

This collection does not hold product plans, project histories, private organizational knowledge, domain doctrine, or project architecture decision records. Guidance about writing ADRs is a reference topic; individual decisions belong with their projects. Examples use generic names and identify assumptions explicitly.

## How to read a sheet

Each sheet states its technology baseline, review date, purpose, related topics, and primary references. Check the baseline before copying an example. A review date does not mean that the example targets the newest release or was executed in every environment.

Examples are fragments unless explicitly identified as complete. Syntax validation, compilation, and behavioral testing establish different things; [contribution guidance](CONTRIBUTING.md) explains the evidence. Official documentation for the deployed version takes precedence over a simplified example.

## Browse locally

Prerequisite: Node.js 22 or newer with npm. From a checkout:

```powershell
cd app
npm ci
npm start
```

The reader opens at http://127.0.0.1:5180. Press `/` to search. Queries, search category, selected page, and heading links can be bookmarked. The reader serves its corpus from the local checkout; public hosting infrastructure is not included.

See [reader documentation on GitHub](https://github.com/jimnewpower/knowledge-base/blob/main/app/README.md), also available as `app/README.md` in the checkout, for navigation and search behavior.

## Repository layout

| Location | Purpose |
|----------|---------|
| [cheatsheets/](cheatsheets/README.md) | Engineering references and their index |
| [guides/](guides/start-here.md) | Reading paths connecting related references |
| [app/](https://github.com/jimnewpower/knowledge-base/tree/main/app) | Search, reader, and automated content checks |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Corrections, new topics, sourcing, and validation |

## Contribute or report a correction

Open an [issue](https://github.com/jimnewpower/knowledge-base/issues) with the page, questionable passage, applicable version, and a primary source or reproduction. Pull requests should make focused, reusable improvements and follow [CONTRIBUTING.md](CONTRIBUTING.md).

Prioritize confusing explanations, unanswered searches, and missing connections. Link to existing coverage before creating a competing explanation. Write original summaries; do not reproduce third-party manuals.

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).

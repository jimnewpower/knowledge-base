# Knowledge base reader

Local search and Markdown viewer for the public software engineering reference in this repository. Requires Node.js 22 or newer.

```powershell
cd app
npm ci
npm start
```

Opens http://127.0.0.1:5180.

## Browse by category

The home page presents nine categories with icons, descriptions, and counts of their primary pages, plus a reading-path guide. Each category starts with conceptual and implementation entry points, then groups notes with “Use this for” summaries. Content-type and topic filters narrow the primary list; a separate **Related topics** section holds selected references from other categories.

- Category: http://127.0.0.1:5180/?category=architecture-design
- Filtered category: http://127.0.0.1:5180/?category=languages-tools&tag=Java
- Note: http://127.0.0.1:5180/?doc=cheatsheets/c4-diagrams.md

Breadcrumbs return to the note's primary category, including when it was opened through a related link or search. Browser Back and Forward restore pages and category filters. The brand and Home link return to the category grid. **All files** in the sidebar retains access to the complete repository tree, including index pages and notes not yet categorized. On narrow screens, **Browse** toggles the category/file navigation; search results open automatically.

Category membership lives in `src/data/categories.ts`. When adding a note:

1. Add its repository-relative path, a short description, and relevant tags to exactly one category section.
2. Optionally list the same path in one other category's `related` array. Do not duplicate the file or give it a second primary home.
3. Update the Markdown indexes as usual. Titles come from each note's H1.
4. Run `npm test` and `npm run build`. Catalog tests detect missing sheets, duplicate primary homes, broken paths, and excess secondary memberships.

Content types are independent of categories: `cheatsheets/`, `architecture/`, `decisions/`, and `runbooks/` map to Cheat sheet, Architecture note, ADR, and Runbook; other paths use Note. Add future documents from those folders to the same category catalog. Counts reflect available primary documents and exclude related links.

Run it from a checkout. The dev server reads the Markdown beside `app/`. Opening `dist/index.html` as a file will not load notes, because the index is served by that server. The port is set in `vite.config.ts`.

## Search

Press `/` to focus search. The address bar keeps the query (`q`) and the open note (`doc`).

- http://127.0.0.1:5180/?doc=cheatsheets/git.md
- http://127.0.0.1:5180/?q=rebase&doc=cheatsheets/git.md

Enter opens the highlighted result. Arrow keys move through results. Escape clears the query.

Search matches titles, headings, paths, summaries, body text, and curated aliases in `src/data/search-aliases.ts`. Words combine with AND. Prefixes match (`kube` finds Kubernetes); words of five or more characters tolerate limited spelling errors. Short API names remain more exact. Aliases help discovery (`a11y`, `i18n`, `ORM`, `auth`) without asserting that related concepts are interchangeable.

**Search in** narrows results to a primary category before ranking and the 40-result limit. The `scope` parameter persists independently of browse filters, including when opening a result or using Back/Forward: http://127.0.0.1:5180/?q=auth&scope=security-identity. Unknown scopes fall back to all categories. No-result guidance offers broader spelling suggestions when available, clearing the category filter, or browsing topics.

Marks in the open note follow literal query words; alias and typo matches may have no literal highlight. Notes rank ahead of index pages (`README.md`) when both mention a query. The open note scrolls to the first literal match.

## Content maintenance

Run `npm run check` for tests (including content quality and search relevance) and the build. `npm run check:content` isolates the content gate. It checks local links and heading anchors, unique titles, required metadata, sheet-index coverage, category ownership for every reference/guide, and complete structured examples marked `validate`.

`npm run check:links` checks remote prose references separately; append repository-relative Markdown paths after `--` for a focused check. Network restrictions and rate limits require manual interpretation. See [CONTRIBUTING.md](../CONTRIBUTING.md) for authoring and evidence requirements.

## What is indexed

Every `.md` file outside `app/`, `node_modules/`, `dist/`, and `coverage/`. Hidden directories are skipped. Saving a note rebuilds the index; the open page picks that up within a few seconds.

## In the page

Cheat sheets have Original and Enhanced tabs. Enhanced renders the same file with the baseline line as labels, simple `→` flows as steps, yes/no/possible table cells as chips, and a copy button on code blocks; `view=enhanced` in the address bar keeps that choice. Irregular flows stay as plain text.

Relative links to other `.md` files open in the reader. Other web links open in a new tab. Source opens the raw file. Headings in the right-hand list jump within the note.

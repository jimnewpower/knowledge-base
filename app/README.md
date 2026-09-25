# Knowledge base reader

Local search and Markdown viewer for the notes in this repository.

```powershell
cd app
npm install
npm start
```

Opens http://127.0.0.1:5180.

## Browse by category

The home page presents nine categories with icons, descriptions, and counts of their primary pages. Each category groups its notes into sections with short summaries. Content-type and topic filters narrow the primary list; a separate **Related topics** section holds selected references from other categories.

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

Search matches titles, headings, paths, and body text. Words combine with AND. A prefix matches (`kube` finds Kubernetes). Marks in the open note follow whole words. Notes rank ahead of index pages (`README.md`) when both mention the query. The open note scrolls to the first match and marks the terms.

## What is indexed

Every `.md` file outside `app/`, `node_modules/`, `dist/`, and `coverage/`. Hidden directories are skipped. Saving a note rebuilds the index; the open page picks that up within a few seconds.

## In the page

Cheat sheets have Original and Enhanced tabs. Enhanced renders the same file with the baseline line as labels, simple `→` flows as steps, yes/no/possible table cells as chips, and a copy button on code blocks; `view=enhanced` in the address bar keeps that choice. Irregular flows stay as plain text.

Relative links to other `.md` files open in the reader. Other web links open in a new tab. Source opens the raw file. Headings in the right-hand list jump within the note.

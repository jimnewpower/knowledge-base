# Knowledge base reader

Local search and Markdown viewer for the notes in this repository.

```powershell
cd app
npm install
npm start
```

Opens http://127.0.0.1:5180.

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

Relative links to other `.md` files open in the reader. Other web links open in a new tab. Source opens the raw file. Headings in the right-hand list jump within the note.

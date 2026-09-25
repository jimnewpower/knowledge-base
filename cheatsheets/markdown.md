# Markdown cheat sheet

> Baseline: CommonMark 0.31.2, GFM[^gfm] tables/task lists, and this reader's remark-gfm extensions. Reviewed: 2026-09-24.

Markdown is the notation of this knowledge base. Keep it boring so diffs stay readable.

## Block structure

~~~~markdown
# Heading 1 — one per file, the title
## Heading 2
### Heading 3

Paragraphs are separated by a blank line.

- Unordered item
  - Nested under it
    1. Numbered
    2. Still numbered

> Block quote — use for constraints or callouts, not decoration.

---

Fenced code:

```java
record Money(BigDecimal amount) {}
```
~~~~

Put a language on fences (`java`, `bash`, `xml`, `http`, `text`). Bare fences still render; they do not highlight.

## Inline

| You type | You get |
|----------|---------|
| `*italic*` or `_italic_` | italic |
| `**bold**` | bold |
| `` `code` `` | `code` |
| `[Git](git.md)` | [Git](git.md) |
| `~~strike~~` | strike |

Prefer `**bold**` and `*italic*`. Put identifiers such as `order_id` in code spans; CommonMark leaves intraword underscores literal.

## Links and images

Example abbreviations: TDD[^tdd].

```markdown
[TDD](tdd.md)
[ADR-0001](../decisions/0001-record-architecture-decisions.md)
![Alt text that describes the figure](../diagrams/order-flow.svg)
```

The ADR[^adr] and image paths above illustrate syntax; create the targets before using those links in a note.

- Relative links inside the repo. They survive clones.
- Alt text is the caption for readers who cannot see the image.
- Do not embed huge binaries; keep diagrams in `diagrams/`.

## Tables

```markdown
| Status | Meaning |
|--------|---------|
| 200 | OK |
| 404 | Missing |
```

Leading and trailing pipes are optional; keep them for alignment. Tables cannot contain block elements (lists, fences) portably.

## Task lists (GitHub)

```markdown
- [x] Done
- [ ] Not done
```

Fine in working notes. Do not build process around them.

## Footnotes (renderer extension)

Supported by GitHub and this reader's `remark-gfm` pipeline; footnotes are not part of the formal GFM specification. Check other renderers before relying on them.

```markdown
TLS[^tls] protects the connection.

[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
```

Define every acronym in a footnote on each sheet that uses it, even when it seems familiar or is already expanded inline. Reference its first use and put definitions at the end of the file. Place the marker after a link or code span, never inside its syntax; explain acronyms used in executable examples in nearby prose. Reuse a definition for singular/plural forms. Give the full expansion and enough context to refresh the reader's memory.

## Things that break

- Tabs mixed with spaces in lists.
- Ambiguous list indentation or fence delimiters. Blank lines improve readability; CommonMark does not require one before every fence or list.
- Raw HTML[^html] when a Markdown construct exists — HTML is a trap for later renderers.
- Deep heading jumps (`#` then `####`).
- Trailing whitespace (it is a line break in some renderers).

## Conventions in this repository

- One H1, matching the topic.
- American engineering English, short headings.
- Cross-link related sheets rather than pasting them.
- No generated table-of-contents unless the file is long enough to need one.
- Wrap prose at a comfortable width if you wrap at all; do not fight a teammate’s wrap.

## Escapes

```markdown
\* not italic
``use `backticks` inside code``
```

Backslash escapes do not work inside code spans or fenced blocks. Use a longer backtick delimiter around a span containing backticks, and a longer outer fence around a fenced example.

## References

- [CommonMark 0.31.2 — fences, code spans, and escaping](https://spec.commonmark.org/0.31.2/)
- [GitHub Flavored Markdown specification](https://github.github.com/gfm/)
- [remark-gfm — supported extensions](https://github.com/remarkjs/remark-gfm)

[^gfm]: GitHub Flavored Markdown.
[^adr]: Architecture Decision Record.
[^html]: Hypertext Markup Language.
[^tdd]: Test-Driven Development.

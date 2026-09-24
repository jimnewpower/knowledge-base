# Markdown cheat sheet

Markdown is the notation of this knowledge base. Keep it boring so diffs stay readable.

## Block structure

```markdown
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
```

Put a language on fences (`java`, `bash`, `xml`, `http`, `text`). Bare fences still render; they do not highlight.

## Inline

| You type | You get |
|----------|---------|
| `*italic*` or `_italic_` | italic |
| `**bold**` | bold |
| `` `code` `` | `code` |
| `[Git](git.md)` | [Git](git.md) |
| `~~strike~~` | strike |

Prefer `**bold**` and `*italic*`. Mixing `_` in identifiers (`order_id`) fights underscore emphasis.

## Links and images

```markdown
[TDD](tdd.md)
[ADR-0001](../decisions/0001-record-architecture-decisions.md)
![Alt text that describes the figure](../diagrams/order-flow.svg)
```

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

## Footnotes (GitHub Flavored)

```markdown
Claim with a source.[^rfc9110]

[^rfc9110]: RFC 9110, HTTP Semantics.
```

## Things that break

- Tabs mixed with spaces in lists.
- Missing blank line before a fence or list.
- Raw HTML when a Markdown construct exists — HTML is a trap for later renderers.
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
`use \`backticks\` inside code`
```

Inside fences, nothing is escaped except the closing fence. For a fence inside a fence, use a longer tick run on the outer fence.

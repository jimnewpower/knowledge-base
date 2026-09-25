# HTML, CSS, and browser fundamentals cheat sheet

> Baseline: semantic HTML, CSS Grid/Flexbox, and evergreen browser APIs; check support in your target browsers. Reviewed: 2026-09-25.

Use this when building a page or diagnosing layout and browser behavior independently of a framework.

Related: [accessibility](accessibility.md), [JavaScript](javascript.md), [React](react.md), [HTTP and TLS](http-and-tls.md).

## Choose the element first

| Need | Starting point | Common mistake |
|------|----------------|----------------|
| Navigate | `<a href="…">` | A click-only span |
| Perform an action | `<button type="button">` | Accidental form submission |
| Submit fields | `<form>` and a submit button | Ignoring Enter and browser validation |
| Name an input | A connected `<label>` | Treating a placeholder as its label |
| Structure content | Headings, `main`, `nav`, lists | Choosing heading levels for font size |

HTML fragment; the endpoint must implement server-side validation and request handling:

```html
<form action="/preferences" method="post">
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="email" required>
  <button type="submit">Save</button>
</form>
```

Client validation provides feedback; enforce rules on the server too. Controls need a `name` to contribute a value to ordinary form submission. See [MDN's HTML guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content).

## Diagnose CSS in order

Inspect matching rules and computed values. Cascade origin, importance, and layers precede specificity; source order breaks later ties. Then inspect box sizing, the containing block, and overflow. A child's minimum size can prevent a flex/grid item from shrinking.

CSS fragment for an existing `.cards` container:

```css
* { box-sizing: border-box; }
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}
.cards > * { min-width: 0; overflow-wrap: anywhere; }
```

Check narrow widths, enlarged text, and long content. Avoid fixed heights for text containers. See [the cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction).

## Browser boundaries

DOM changes, network completion, and painting are different events. Inspect requests and responses before assuming rendering failed. Avoid long synchronous work in input handlers.

An origin combines scheme, host, and port. Same-origin restrictions constrain script access across origins; CORS permits selected cross-origin reads. CORS is not authorization or a substitute for CSRF protection. See [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy).

## Verification

Exercise keyboard submission, invalid values, narrow layouts, failed requests, and browser Back. Inspect semantic structure as well as appearance.

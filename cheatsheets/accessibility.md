# Web accessibility cheat sheet

> Baseline: WCAG[^wcag] 2.2 vocabulary and WAI[^wai] implementation guidance for web interfaces. Reviewed: 2026-09-25.

Use this when designing controls or checking keyboard, assistive-technology, and enlarged-text workflows. This is an implementation starting point, not a conformance audit.

Related: [HTML and CSS](html-css-browser.md)[^html][^css], [React](react.md), [testing](testing.md), [localization](localization.md).

## Build meaning into the page

| Concern | Starting point |
|---------|----------------|
| Structure | Descriptive headings and meaningful page regions |
| Controls | Native links, buttons, inputs, and labels |
| Images | Describe informative content; empty alt text for decoration |
| Focus | Visible keyboard focus and sensible reading/tab order |
| Forms | Persistent labels, instructions, field-specific errors |
| Status | Announce relevant asynchronous results without unnecessary focus movement |

ARIA[^aria] exposes semantics; it does not implement keyboard interactions. A custom widget needs both. See [WAI tutorials](https://www.w3.org/WAI/tutorials/).

## Label and explain input

HTML fragment. On failure, populate the error and set `aria-invalid="true"`; clear both when corrected.

```html
<label for="display-name">Display name</label>
<input id="display-name" name="displayName"
       aria-describedby="name-help name-error">
<p id="name-help">Use a name other readers will recognize.</p>
<p id="name-error"></p>
```

Associate the visible label programmatically. Placeholders disappear while typing and should not carry the only instruction. Use fieldset/legend for meaningful control groups. See [labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/).

## Check an entire workflow

1. Use Tab, Shift+Tab, Enter, Space, and applicable widget keys. Check reachability and unintended focus traps.
2. Open and close overlays. Verify initial/return focus and that hidden content is not keyboard reachable.
3. Enlarge text and narrow the viewport. Check clipping, overlapping labels, and scrolling.
4. Check contrast, color-independent errors, and reduced-motion behavior.
5. Use a screen reader to check labels, errors, and status updates. Combine automated checks with manual task completion.

Record browser/assistive-technology versions and observed failures. A passing scanner does not establish workflow usability or complete conformance.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/)

[^wcag]: Web Content Accessibility Guidelines.
[^wai]: Web Accessibility Initiative.
[^html]: Hypertext Markup Language.
[^css]: Cascading Style Sheets.
[^aria]: Accessible Rich Internet Applications — semantics exposed to assistive technology.

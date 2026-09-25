# Internationalization and localization cheat sheet

> Baseline: Unicode text, BCP 47 locale identifiers, and JavaScript Intl APIs in modern browsers/Node.js. Reviewed: 2026-09-25.

Use this when adapting interfaces to languages, regional formats, or writing directions. Internationalization (i18n) enables adaptation; localization (l10n) supplies a particular experience. See [W3C terminology](https://www.w3.org/International/questions/qa-i18n).

Related: [Java date and time](java-time.md), [JavaScript](javascript.md), [HTML and CSS](html-css-browser.md), [accessibility](accessibility.md).

## Separate the choices

| Choice | Do not infer solely from |
|--------|--------------------------|
| Language | Country or network address |
| Time zone | Language or currency |
| Currency | Browser locale |
| Text direction | Physical left/right positions in a design |
| Stored value | A localized display string |

Store structured values; format at display boundaries. Translate complete messages instead of concatenating fragments. Plan plural forms, context, and fallbacks. These are design recommendations, not a prescribed translation framework.

## Format explicitly

Complete JavaScript example. Formatting a currency does not convert its value between currencies.

```javascript
function formatPrice(amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency", currency,
  }).format(amount);
}

function formatInstant(isoInstant, locale, timeZone) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium", timeStyle: "short", timeZone,
  }).format(new Date(isoInstant));
}

const priceLabel = formatPrice(1234.5, "de-DE", "EUR");
const timeLabel = formatInstant("2026-09-25T16:00:00Z", "en-US", "America/Denver");
```

Spacing and punctuation can vary with locale data. Do not parse formatted output to recover the original value. `Intl.Collator` provides locale-sensitive ordering; `Intl.PluralRules` selects plural categories. See [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

## Layout and input

Declare document language and appropriate direction. Prefer CSS logical properties when layout should follow writing direction. Test long labels and mixed-direction content. Date-only values and instants need different models; a birthday is not an instant at midnight UTC.

Define parsing separately from formatting. Reject ambiguous input with useful feedback. Keep search normalization separate from identity comparisons; do not alter stored names to simplify search.

## Verification

Test contrasting locales, right-to-left layout, plural boundaries, missing translations, and zone/day boundaries. Content-example tests exercise explicit locale and time-zone behavior without pinning incidental punctuation.

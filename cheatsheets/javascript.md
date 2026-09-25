# JavaScript cheat sheet

> Baseline: modern ECMAScript modules and browser Fetch APIs; server runtimes require their own compatibility checks. Reviewed: 2026-09-25.

Understand runtime values and asynchronous completion even when TypeScript supplies static types.

Related: [HTML, CSS, and browsers](html-css-browser.md), [TypeScript](typescript.md), [React](react.md), [Angular](angular.md), [localization](localization.md), [HTTP clients](http-clients-webhooks.md).

## Everyday semantics

| Construct | Use / trap |
|-----------|------------|
| `const` / `let` | Block scope; `const` prevents reassignment, not object mutation |
| `===` | Avoid coercive equality; `NaN` still differs from itself |
| `value ?? fallback` | Default only for null/undefined; `\|\|` also replaces `0`, `false`, and `""` |
| `obj?.property` | Handles nullish receivers; does not validate the property's type |
| `{ ...obj }` | Shallow copy; nested objects remain shared |
| `array.sort()` | Mutates and defaults to string ordering; numeric ascending uses `(a, b) => a - b` |
| `Map` / `Set` | Arbitrary keys / distinct values; objects compare by identity |
| `Number` | IEEE 754 double; integers beyond the safe range lose precision |
| `BigInt` | Exact integers; ordinary JSON serialization needs an explicit representation policy |

An arrow function captures lexical `this`; a regular function's `this` depends on invocation. Preserve or bind a method receiver when passing callbacks.

## Promises and cancellation

Exported browser-module fragment. It returns parsed data without claiming a schema; the caller must validate it. Supply an `AbortController` signal to cancel obsolete work.

```javascript
export async function readJson(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Request failed: HTTP ${response.status}`);
  }
  return response.json();
}
```

`fetch` normally resolves for HTTP errors; network failure/abort and HTTP status are distinct. An empty 204 response cannot be parsed as JSON. If cancellation races with completion, guard state updates with a request identity as well.

| Operation | Completion behavior |
|-----------|---------------------|
| `await` in a loop | Sequential; useful for ordered work |
| `Promise.all` | Rejects on first rejection; other work continues |
| `Promise.allSettled` | Returns every outcome; inspect rejected entries |
| `Promise.race` | First settlement; does not cancel losing operations |

`forEach(async () => ...)` does not await its callbacks. A large `Promise.all(items.map(...))` creates unbounded work; use an explicit concurrency limit for remote APIs.

## Browser boundaries

Use `textContent` for untrusted text. Treat `innerHTML` as an HTML injection boundary. Persisted storage and network JSON need version/schema validation. Never embed a server secret in a shipped JavaScript bundle; build-time environment substitution makes values visible to users.

## References

- [MDN JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN promise composition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

# TypeScript and runtime validation cheat sheet

> Baseline: TypeScript 5.8 with strict checking; examples use standard JavaScript runtime APIs. Reviewed: 2026-09-24.

TypeScript checks what your program claims about values. Validate external data before turning those values into trusted application types.

Related: [OpenAPI and JSON Schema](openapi-and-json-schema.md), [REST APIs](rest-apis.md), [React fundamentals](react.md), [React Native offline data](react-native-offline.md).

## Compiler settings

`compilerOptions` fragment to merge into the application's `tsconfig.json`; module/target settings depend on its runtime and bundler.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true
  }
}
```

The latter three checks are additional choices, not all implied by `strict`. Indexing an array/map can yield `undefined`; an optional property being absent can mean something different from explicitly setting it to `undefined`.

## Validate an unknown boundary value

Complete exported type/function fragment. Policy: require the two fields below, tolerate extra object fields, and return a normalized object containing only known fields.

```typescript
export type TrackPoint = Readonly<{ latitude: number; longitude: number }>;

export function parseTrackPoint(value: unknown): TrackPoint {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Track point must be an object");
  }
  if (!("latitude" in value) || !("longitude" in value)) {
    throw new TypeError("Track point requires latitude and longitude");
  }
  const { latitude, longitude } = value;
  if (typeof latitude !== "number" || !Number.isFinite(latitude)
      || latitude < -90 || latitude > 90
      || typeof longitude !== "number" || !Number.isFinite(longitude)
      || longitude < -180 || longitude > 180) {
    throw new TypeError("Track point coordinates are outside their valid range");
  }
  return { latitude, longitude };
}
```

Treat parsed JSON as `unknown`, then call the parser. `as TrackPoint`, a generic `fetchJson<TrackPoint>()`, and a generated interface do not validate the network response. For larger contracts, choose a runtime schema validator and test that its schema matches the published API.

## Model states explicitly

| Construct | Use | Trap |
|-----------|-----|------|
| Discriminated union | `idle`, `loading`, `ready`, `failed` with state-specific fields | Several booleans permit impossible combinations |
| `unknown` | Data requiring inspection | Replacing it with `any` disables useful checks |
| Type guard | Reusable verified narrowing | A declared predicate is trusted even when its implementation is wrong |
| `satisfies` | Check an expression against a type while preserving useful inference | No runtime validation |
| Generics | Preserve relationships between input and output types | Unconstrained type parameters pretending to prove a conversion |
| `Readonly` | Prevent assignments through a typed reference | Not deep runtime immutability or an object freeze |

Use an exhaustive `switch` with a `never` check when every union variant must be handled. Add a new variant and confirm callers fail compilation where behavior is missing. Avoid non-null assertions that merely silence an unresolved loading or lookup state.

## Async boundaries

Handle rejected promises and non-success HTTP responses separately. `fetch` normally resolves for HTTP 4xx/5xx; inspect status before accepting the body. Cancel obsolete requests where supported and prevent stale completions from overwriting newer state. Validate persisted data after app upgrades as well as network data.

Test malformed objects, missing fields, nulls, non-finite numbers, range boundaries, and the chosen extra-field policy. Compile checks and runtime checks address different failure modes.

## References

- [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Strict mode](https://www.typescriptlang.org/tsconfig/strict.html)
- [TypeScript object types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Fetch response handling](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

# Angular cheat sheet

> Baseline: Angular 20+ standalone application style; pin a compatible Angular, Node.js, TypeScript, and RxJS combination. Reviewed: 2026-09-25.

Keep components focused on interaction, services focused on use cases and I/O, and API responses subject to runtime validation.

Related: [HTML, CSS, and browsers](html-css-browser.md), [accessibility](accessibility.md), [TypeScript](typescript.md), [JavaScript](javascript.md), [application design](application-design.md), [Entra ID and SSO](entra-id.md).

## Building blocks

| Construct | Use | Common mistake |
|-----------|-----|----------------|
| Standalone component | View plus explicit template dependencies | Assuming every dependency is globally available |
| Injectable service | Shared behavior and boundary adapters | Placing every screen's mutable state in a root singleton |
| Signal | Synchronous reactive state | Mutating a contained object without notifying consumers |
| `computed` | Derived state | Duplicating derived values in writable state |
| Effect | Synchronize with an external side effect | Using effects as an implicit business workflow |
| Reactive form | Explicit controls, validation and submission state | Treating client-side validation as server authorization |
| Router guard | Navigation/user experience | Relying on it to secure server endpoints |

For existing NgModule applications, migrate one boundary at a time; standalone conversion does not require rewriting business services. Check the official version matrix before changing TypeScript independently.

## HTTP and RxJS decisions

Configure `HttpClient` with the provider API appropriate to the app. A request observable is cold: multiple subscriptions can send multiple requests. `http.get<Order>()` supplies a compile-time assertion, not runtime checking; read uncertain data as `unknown` and validate it.

| Operator / pattern | Intent | Consequence |
|--------------------|--------|-------------|
| `switchMap` | Latest search/filter result wins | Unsubscribes the previous inner stream; do not use to guarantee completion of writes |
| `concatMap` | Ordered writes | Queues work; bound input to prevent indefinite backlog |
| `exhaustMap` | Ignore repeated submit while busy | Later triggers are discarded until completion |
| `mergeMap` with concurrency | Independent bounded operations | Completion order can differ from input order |
| Async pipe / `takeUntilDestroyed` | View-lifetime subscription cleanup | Choose the correct injection/lifetime context |

Represent loading, empty, ready, and failed states explicitly. Place error recovery where a failed request will not accidentally terminate all future search triggers. Unsubscribing an HTTP call can abort transport; a server may already have committed its write.

## Delivery and checks

Use the project's locked package manager inputs and scripts for build/test. Serve a production build with the correct base path and route fallback. Test direct navigation to a nested route, expired identity, malformed responses, slow requests, form errors, and keyboard interaction.

Treat browser bundles as public artifacts: environment files contain public configuration only. Interceptors should attach access tokens only to an allow-listed API origin; avoid sending credentials to arbitrary request URLs. Server rendering also requires isolating request/user state and guarding browser-only APIs.

## References

- [Angular signals](https://angular.dev/guide/signals)
- [Angular HTTP requests](https://angular.dev/guide/http/making-requests)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [RxJS higher-order observables](https://rxjs.dev/guide/higher-order-observables)

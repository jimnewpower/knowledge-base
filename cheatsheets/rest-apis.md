# REST API cheat sheet

> Baseline: HTTP resource APIs using RFC 9110 semantics; examples are HTTP/1.1 fragments. Reviewed: 2026-09-24.

REST here means **HTTP APIs organized around resources**, not “JSON over POST.” Roy Fielding’s constraints matter where they reduce coupling: uniform interface, stateless requests, cacheability, explicit representations.

Companion notes: [authentication.md](authentication.md), [authorization.md](authorization.md), [API Gateway](api-gateway.md).

## Resource design

| Do | Avoid |
|----|--------|
| `/orders/4821` | `/getOrder?id=4821` |
| `/orders/4821/items` | `/orderItemsByOrderId` |
| Nouns, plural collections | Verbs in the path (`/createOrder`) |
| Stable identifiers | Encoding workflow state only in the path when a field will do |

One resource, many representations: `Accept: application/json` vs `application/xml`. Prefer JSON unless a client already owns XML.

## Methods and semantics

| Method | Safe | Idempotent | Typical use |
|--------|------|------------|-------------|
| `GET` | yes | yes | Read |
| `HEAD` | yes | yes | Metadata only |
| `POST` | no | no | Create, or non-idempotent action |
| `PUT` | no | yes | Replace the resource at this URI |
| `PATCH` | no | not necessarily | Partial update |
| `DELETE` | no | yes | Remove |

Safe methods must not change server state (logging is fine). Idempotent methods may be retried with the same effect.

## Status codes (the useful set)

| Code | When |
|------|------|
| 200 | Success with a body |
| 201 | Created; `Location` points at the new resource |
| 204 | Success, no body (common for DELETE) |
| 400 | Malformed request |
| 401 | Unauthenticated |
| 403 | Authenticated but not allowed |
| 404 | No such resource (or hide existence) |
| 409 | Conflict (duplicate, stale version) |
| 412 | Precondition failed (`If-Match`) |
| 415 | Unsupported media type |
| 422 | Syntactically OK, semantically not |
| 429 | Rate limited |
| 500 | Unexpected server failure |
| 503 | Temporarily unavailable |

Do not invent `200` with `{"success": false}`. The status is part of the contract.

## Request and response shape

```http
GET /api/v1/orders/4821 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <token>
If-None-Match: "c9f0"
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "c9f1"
Cache-Control: private, max-age=0, must-revalidate

{
  "id": "4821",
  "status": "OPEN",
  "total": { "amount": "19.95", "currency": "USD" }
}
```

Error body — pick one shape and keep it:

```json validate
{
  "error": "order_conflict",
  "message": "Order 4821 already submitted",
  "details": []
}
```

## Versioning

| Strategy | Tradeoff |
|----------|----------|
| URI `/api/v1/...` | Visible, easy to route, clutters paths |
| Header `Accept: application/vnd.example.v1+json` | Pure, harder to debug in a browser |
| Additive change, no version bump | Best when you can stay compatible |

Prefer additive evolution, but check the direction of the contract: requiring a new request field breaks existing callers; guaranteeing an existing response field is usually compatible. Adding response fields requires clients that tolerate unknown properties. See the request/response matrix in [openapi-and-json-schema.md](openapi-and-json-schema.md).

## Pagination, filtering, concurrency

```http
GET /orders?status=OPEN&limit=50&cursor=eyJ...
```

Cursor pagination beats `offset` at scale. Return a next-cursor, not a page count you cannot afford to compute.

Optimistic concurrency:

```http
PUT /orders/4821
If-Match: "c9f1"
```

Respond `412` if the ETag does not match.

## Idempotency for POST

For APIs that implement an idempotency contract, clients send `Idempotency-Key` on create/payment-style POST. The server atomically reserves a key scoped to the authenticated tenant/client and operation, verifies the payload fingerprint, and stores the completed result. Define concurrent requests, failures, expiry, and recovery; sending the header alone does not prevent duplicates. See [resilience.md](resilience.md).

## Hypermedia vs practical REST

Full HATEOAS is rare in enterprise APIs. Minimum bar that still counts as disciplined HTTP:

- Resources and uniform methods
- Explicit status codes
- Documented media types (OpenAPI)
- Cache and precondition headers where they pay off

## OpenAPI and contracts

- The OpenAPI document is part of the architecture. Treat changes like ADRs.
- Generated clients drift; generate from the published spec in CI, or test the spec against the running app (contract tests).
- Do not hand-wave `object` for every payload. Name the schemas.

## Gotchas

- `GET` with a body is undefined territory. Do not.
- `PUT` of a partial object is a `PATCH`. Accidental field wipe is a classic bug.
- Returning `404` vs `403` leaks existence. Pick a policy for sensitive resources.
- Chatty APIs (`GET /orders` then N `GET /orders/{id}`) need a composed view or includes — not a new microservice.

## References

- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [OpenAPI 3.0.3 specification](https://spec.openapis.org/oas/v3.0.3)

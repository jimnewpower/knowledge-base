# Resilience and integration failure cheat sheet

> Baseline: HTTP integrations with explicit server idempotency contracts; retry policies are application-specific. Reviewed: 2026-09-24.

When you call another process, the answer may be **success, failure, or unknown**. Resilience is how the calling system stays correct and available anyway.

Related: [distributed-systems.md](distributed-systems.md), [http-and-tls.md](http-and-tls.md), [messaging-and-events.md](messaging-and-events.md), [transactions-and-isolation.md](transactions-and-isolation.md).

## Unknown is the hard case

A timeout on `POST /charges` does not mean the charge failed. The card processor may have taken the money. Retrying without an idempotency key charges twice.

```text
success   → apply result
most 4xx  → fix the request or map to a domain error
429       → honor Retry-After; retry only within the deadline and if safe
5xx/timeout/reset → bounded retry only for transient failures and safe operations
```

## Timeouts

Every remote call needs one. Default infinite timeouts are how a stuck dependency takes your thread pool with it.

| Timeout | Covers |
|---------|--------|
| Connect | Connection establishment; DNS/TLS coverage depends on the client |
| Read / request | Read inactivity or request duration, depending on the client |
| Total / deadline | Whole use case, including retries |
| Queue / pool acquire | Waiting for a connection from the pool |

Set the API’s deadline shorter than the caller’s. Propagate remaining time when you can.

## Retries

```text
attempt 1 → fail
wait 100ms + jitter
attempt 2 → fail
wait 200ms + jitter
give up and surface unknown/failure
```

- Cap attempts (2–4 is common).
- Exponential backoff plus **jitter** so every client does not retry on the same millisecond.
- Retry idempotent operations only when the failure is transient. Retry `POST` only when the server implements the agreed idempotency contract; sending a header alone provides no guarantee.
- Do not blindly retry `400`/`401`/`403`/`404`/`422`. Authentication renewal or eventual-resource workflows need an explicit policy.
- For `429` and retryable `503`, honor `Retry-After` (seconds or HTTP date), add jitter where appropriate, and stop if the wait exceeds the remaining deadline. Handle `408` according to the client/API contract and operation safety.
- Put retries at one layer where possible; nested retry loops multiply load.

## Idempotency

The server reserves a key and stores the completed result for a documented retention period. Scope the key to the authenticated tenant/client and operation; a global user-supplied key can leak another caller's result.

Client:

```http
POST /orders
Idempotency-Key: 7f1d3a0e-…
```

1. Atomically reserve `(tenant/client, operation, key)` with a unique constraint and store a request fingerprint. A lookup followed by an unprotected insert races.
2. Apply database changes and save the completed result in the same transaction when possible. Concurrent duplicates must wait or receive a documented in-progress response.
3. Same key + same payload returns the saved result after authorization. Reject a different payload with a documented client error (for example `409`); status conventions vary by API.
4. Define which failures are saved, expiry, and crash recovery. After expiry the same key may create new work; external calls need downstream idempotency or durable reconciliation.

For queue consumers, insert the unique event ID and apply database effects **in one transaction**, commit, then acknowledge. Committing the ID separately can cause retries to skip unfinished work. External effects need an outbox or downstream idempotency; an inbox alone cannot make an HTTP call atomic. See [messaging-and-events.md](messaging-and-events.md).

## Circuit breaker

```text
closed  → calls flow; failures increment a counter
open    → fail fast without calling the dependency
half-open → let a probe through; success closes, failure opens
```

Use when a sick dependency would otherwise consume all of your threads. Pair with a fallback only if a degraded answer is defined (cached catalog, not “invent a payment”).

## Bulkhead

Separate pools so mail outages cannot eat the HTTP pool used for checkout.

```text
order-http-pool     32 connections
mail-http-pool       4 connections
```

Thread pools, connection pools, and queue capacities are bulkheads. One unbounded executor is none.

## Load shedding

When you are overloaded, refuse work on purpose (`429` / `503`) instead of becoming infinitely slow. Protect the write path that holds money over the nicety of extra search filters.

## Outbox and dual write

Do not `save(order)` and `kafka.send(event)` as two independent commits. Use an outbox table in the same database transaction. See [transactions-and-isolation.md](transactions-and-isolation.md).

## Checklist for a new integration

1. What is the timeout and deadline?
2. Is the call idempotent? If not, what is the key?
3. Which status codes retry?
4. Which pool does it use?
5. What does the user see on unknown?
6. How do we observe failures ([observability.md](observability.md))?

## Gotchas

- Retrying a non-idempotent POST on timeout.
- Circuit breaker wrapping a dependency that is *supposed* to be down at night, flapping forever.
- Fallback that writes a different system of record “for now.”
- No cap on retries inside a user request that already took 9 seconds.

## References

- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 6585 — 429 Too Many Requests](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [RabbitMQ — reliability and acknowledgments](https://www.rabbitmq.com/docs/reliability)

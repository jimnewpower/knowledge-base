# Resilience and integration failure cheat sheet

When you call another process, the answer may be **success, failure, or unknown**. Resilience is how the calling system stays correct and available anyway.

Related: [distributed-systems.md](distributed-systems.md), [http-and-tls.md](http-and-tls.md), [messaging-and-events.md](messaging-and-events.md), [transactions-and-isolation.md](transactions-and-isolation.md).

## Unknown is the hard case

A timeout on `POST /charges` does not mean the charge failed. The card processor may have taken the money. Retrying without an idempotency key charges twice.

```text
success   → apply result
4xx       → do not retry (fix the request or map to a domain error)
5xx/timeout/reset → retry only if the operation is idempotent or you sent a key
```

## Timeouts

Every remote call needs one. Default infinite timeouts are how a stuck dependency takes your thread pool with it.

| Timeout | Covers |
|---------|--------|
| Connect | TCP/TLS handshake |
| Read / request | Time to first/last byte |
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
- Retry `GET`, `PUT` with the same body, and `POST` only with an `Idempotency-Key` or a known-safe create.
- Do not retry `400`/`401`/`403`/`404`/`422`.

## Idempotency

The server stores `{key → first response}` for a TTL.

Client:

```http
POST /orders
Idempotency-Key: 7f1d3a0e-…
```

Same key + same payload = same result. Same key + different payload = `409`.

For consumers of queues: store processed event ids (inbox) before side effects, or make the side effect itself idempotent (`INSERT … ON CONFLICT`).

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

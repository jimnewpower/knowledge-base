# Caching and invalidation cheat sheet

> Baseline: application caching patterns; Java 21 / Caffeine 3.x example. Distributed cache behavior depends on the chosen product. Reviewed: 2026-09-24.

A cache trades freshness and operational complexity for reduced latency or load. State the **maximum acceptable staleness and authoritative source** before choosing an eviction policy.

Related: [data structures](data-structures.md), [API Gateway](api-gateway.md)[^api], [distributed systems](distributed-systems.md), [observability](observability.md).

## Choose the scope and write policy

| Choice | Useful for | Cost to own |
|--------|------------|-------------|
| Local cache | Cheap reads within one process | Each replica has its own values and memory limit |
| Distributed cache | Shared reusable values across processes | Network latency, outages, serialization, consistency policy |
| Cache-aside | Application loads the source on a miss | Invalidation and concurrent load/write races |
| Write-through | Update through a cache-facing write path | Cache/source failure ordering still needs a contract |
| Write-behind | Defer source writes | Needs durable buffering and recovery if loss is unacceptable |

These are selection heuristics. Do not let a disposable cache quietly become the only copy of business data.

## Bounded local example

Java method-body fragment requiring Caffeine 3.x; place imports at class level. The value is illustrative, not a pricing rule.

Example abbreviations: USD[^usd].

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.math.BigDecimal;
import java.time.Duration;

// Declarations and statements below belong inside the example method.
record PriceKey(String tenant, long productId, String currency) {}

Cache<PriceKey, BigDecimal> prices = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .recordStats()
    .build();

var key = new PriceKey("tenant-a", 42L, "USD");
var price = prices.get(key, ignored -> new BigDecimal("12.30"));
```

`get(key, loader)` coordinates atomic loading for that key in this cache instance; it does not coordinate all replicas. Loader failures need a policy. See [Caffeine population](https://github.com/ben-manes/caffeine/wiki/Population).

## Expiration, refresh, and capacity

| Mechanism | Meaning |
|-----------|---------|
| `expireAfterWrite` | Entry becomes unavailable after a write-age limit |
| `expireAfterAccess` | Repeated access extends lifetime; not a maximum data-age guarantee |
| `refreshAfterWrite` | Makes a loading-cache entry eligible for refresh on access; old value can serve during refresh |
| Maximum size/weight | Bounds cache capacity; eviction can happen before a time limit |

Refresh is not a periodic polling schedule. In Caffeine, refresh failures keep the old value; add expiration if stale data must eventually stop serving. Expiration is not source-change notification. Sources: [eviction](https://github.com/ben-manes/caffeine/wiki/Eviction), [refresh](https://github.com/ben-manes/caffeine/wiki/Refresh).

## Invalidation race to recognize

```text
reader: miss -> reads old source value --------> installs old value
writer:                 commits new value -> invalidates key
```

Even invalidating after commit can race with an in-flight load. Suggested remedies include versioned values/keys, coordinated loading and writes, or a bounded-staleness contract. A second delayed invalidation alone is not a general proof of correctness. Keep authoritative authorization, balances, or inventory decisions off stale cache values unless the domain explicitly permits it.

## Protect the failure path

- Include tenant and all representation dimensions in keys; never share results across unauthorized users.
- Use short-lived negative entries only for meaningful absence. Do not turn a database outage into cached “not found.”
- Coalesce loads, cap concurrency, and consider TTL[^ttl] jitter to avoid synchronized refreshes. Local coalescing still permits one load per replica.
- Decide whether cache outage permits source fallback, stale reads, or failure; fallback must not overwhelm the source.
- Test with a controllable clock/ticker rather than sleeps. Monitor hit rate alongside load latency, errors, eviction, memory, and source traffic.

## References

- [Caffeine — population](https://github.com/ben-manes/caffeine/wiki/Population)
- [Caffeine — eviction](https://github.com/ben-manes/caffeine/wiki/Eviction)
- [Caffeine — refresh](https://github.com/ben-manes/caffeine/wiki/Refresh)

[^api]: Application Programming Interface — the contract through which software components interact.
[^ttl]: Time To Live.
[^usd]: United States Dollar — the currency code.

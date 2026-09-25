# Observability cheat sheet

> Baseline: OpenTelemetry concepts, W3C trace context, and Spring Boot 3.5/Micrometer examples. Reviewed: 2026-09-24.

Observability is whether you can **explain a live system’s behavior from its outputs**: logs, metrics, traces, and health. Dashboards are views. They are not the signal.

Related: [devops.md](devops.md), [kubernetes-openshift.md](kubernetes-openshift.md), [spring-boot.md](spring-boot.md), [Log4j 2 configuration](log4j2.md), [OpenTelemetry and Micrometer implementation](opentelemetry-micrometer.md).

## The three pillars plus health

| Signal | Answers | Shape |
|--------|---------|-------|
| Logs | What happened in this case? | Discrete events, structured fields |
| Metrics | Is this class of thing healthy? | Numbers over time, cheap to store |
| Traces | Where did this request go? | Spans across processes |
| Health | May I send traffic / should I restart? | Probe endpoints |

If you can only afford one correlation field, make it a **request / trace id** on every log line.

## Logs

```json validate
{
  "ts": "2026-09-24T19:01:02.123Z",
  "level": "ERROR",
  "logger": "com.example.order.CloseOrder",
  "msg": "submit failed",
  "orderId": "4821",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

Rules:

- Structured (JSON) in anything that is not a human-facing CLI.
- `INFO` for state changes, `WARN` for recovered problems, `ERROR` for failed user/work items.
- No secrets, tokens, passwords, full card numbers, or session cookies.
- Log *at the boundary* (accepted, rejected, emitted) rather than every getter.
- MDC / logging context for `traceId` and tenant. Propagate context across async boundaries and clear it after work; thread-local state does not automatically follow every executor or reactive stage.

## Metrics

RED for request-serving services:

| Letter | Metric |
|--------|--------|
| Rate | requests / second |
| Errors | failures / second or ratio |
| Duration | latency histogram (p50 / p95 / p99) |

USE for resources:

| Letter | Metric |
|--------|--------|
| Utilization | how busy |
| Saturation | queue depth, pool wait |
| Errors | hardware / syscall failures |

Prefer histograms for latency, not a single average. Averages hide the user who waited 8 seconds.

Spring: Micrometer + `prometheus` endpoint. Name metrics with a domain prefix (`order_submit_seconds`).

## Traces

One request = one trace id. Each hop = a span (`order-api`, `postgres`, `mail`).

```text
[gateway] span
   └── [order-api] span
         ├── [jdbc] span
         └── [http mail] span
```

Propagate `traceparent` (W3C) or B3 headers on outbound calls. Head sampling decides before the result is known, so it cannot guarantee retaining every error trace. Tail sampling can select errors or slow traces after spans arrive, at the cost of buffering, routing, and decision latency. It cannot recover spans dropped upstream; budget for late or missing spans and collector limits.

A trace without the SQL span will not tell you the query was the 900 ms.

## Health probes

| Probe | Meaning |
|-------|---------|
| Liveness | Process is wedged — restart it |
| Readiness | Not ready for traffic (warming, dependency gone) |

Readiness may check a cheap DB ping. Liveness generally should not. See [kubernetes-openshift.md](kubernetes-openshift.md).

Spring Boot:

```text
/actuator/health/liveness
/actuator/health/readiness
```

## Alerting

Alert on **user-visible failure** and **budget burn**, not on “CPU > 70% for 1 minute.”

Good: error rate above SLO, p95 above SLO, disk will fill in 4 hours, certificate expires in 14 days.  
Bad: every WARN log, GC happened, a single 5xx.

Pages should have a runbook link. If nobody knows what to do, it is not an alert yet.

## Gotchas

- Logging inside a tight loop at INFO.
- Metrics cardinality explosion (`order_id` as a label).
- Health checks that perform the full business transaction.
- Three tools with three uncorrelated ids.
- Trace sampling that drops the one slow request you needed.

## References

- [OpenTelemetry — head and tail sampling](https://opentelemetry.io/docs/concepts/sampling/)
- [W3C — trace context](https://www.w3.org/TR/trace-context/)

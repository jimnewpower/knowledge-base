# OpenTelemetry and Micrometer implementation cheat sheet

> Baseline: Java 21, OpenTelemetry Java agent 2.x, Micrometer 1.15, and a Collector distribution containing the components shown. Pin concrete deployment versions. Reviewed: 2026-09-24.

Assign one owner to each telemetry signal and instrumentation point. Agent instrumentation, framework instrumentation, and application instrumentation can otherwise emit duplicates.

Related: [observability](observability.md), [Spring Boot](spring-boot.md), [HTTP clients](http-clients-webhooks.md), [JVM performance](jvm-performance.md).

## Choose the arrangement

| Arrangement | Useful when | Check |
|-------------|-------------|-------|
| Java agent | Instrument supported libraries without source changes | Supported library versions, startup flags, agent overhead |
| Micrometer metrics | Application/domain metrics and Spring integration | Registry, meter names, units, tag cardinality |
| Micrometer Observation/Tracing | Application operations need metrics and traces | Configured handlers/bridge; an observation alone does not install exporters |
| Manual OpenTelemetry spans | A meaningful operation is missing | Parent context, scope cleanup, ending spans on failure |
| Collector | Receive, process, and route telemetry | Pipeline wiring, resource limits, export failures, access control |

A reasonable starting arrangement is agent-owned HTTP/database traces and Micrometer-owned metrics. Verify emitted data before adding manual spans around already instrumented operations.

## Local trace path

Bash example. Requires a downloaded, pinned agent JAR, `app.jar`, and the Collector below running on the same host. This arrangement deliberately disables agent metrics/log export; configure the application's Micrometer registry separately.

```bash
export OTEL_SERVICE_NAME=customer-service
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
java -javaagent:./opentelemetry-javaagent.jar -jar app.jar
```

Local-only Collector configuration; the debug exporter writes received traces to Collector logs. A container needs a deliberately configured reachable endpoint instead of assuming its loopback is the host.

```yaml validate
receivers:
  otlp:
    protocols:
      http:
        endpoint: 127.0.0.1:4318
processors:
  batch: {}
exporters:
  debug:
    verbosity: basic
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
```

Production needs an authenticated/TLS export path as appropriate, bounded memory/queues, and monitored drops/retries. This diagnostic configuration has no durable storage. Defining a component does not enable it until a service pipeline references it. See [Collector configuration](https://opentelemetry.io/docs/collector/configuration/).

## Metrics and context

- Use stable low-cardinality tags such as route templates and outcome categories. User IDs, request IDs, raw URLs, and exception messages can create unbounded time series.
- Client-computed percentiles cannot be aggregated into a correct fleet percentile. Histograms support aggregation when the backend and bucket configuration support it; budget bucket count and tag combinations together.
- Propagate context across supported HTTP/messaging boundaries and explicitly address custom executor handoffs. Do not put credentials or sensitive identifiers in baggage.
- Record business outcomes separately from transport success. A 200 response can still contain a rejected business operation.
- Sampling means a missing trace is not proof that no request occurred. Ensure error metrics and operational alerts do not depend solely on sampled traces.

## Verify the path

Send a known request through two services; check shared trace identity, parent/child relationships, service identity, errors, and expected metric counts. Simulate an unavailable exporter and confirm that application latency and memory remain within budget.

## References

- [Java agent configuration](https://opentelemetry.io/docs/zero-code/java/agent/configuration/)
- [Micrometer histograms and percentiles](https://docs.micrometer.io/micrometer/reference/concepts/histogram-quantiles.html)
- [Micrometer Observation](https://docs.micrometer.io/micrometer/reference/observation.html)

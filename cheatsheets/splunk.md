# Splunk search and operations cheat sheet

> Baseline: Splunk Enterprise / Splunk Cloud Platform SPL search language; examples use SPL, not SPL2. Reviewed: 2026-09-25.

Start with a narrow index, source type, and time range. Verify field extraction before using a chart as evidence.

Related: [observability](observability.md), [CloudTrail and CloudWatch](cloudtrail-cloudwatch.md), [OpenTelemetry](opentelemetry-micrometer.md).

## Search pipeline

Replace `application` and `app:json` with your index/source type. Assumes numeric `durationMs` and extracted `service` and `level` fields.

```text
index=application sourcetype="app:json" earliest=-30m latest=now
| stats count AS events count(eval(level="ERROR")) AS errors perc95(durationMs) AS p95Ms BY service
| eval errorPercent=round(100*errors/events, 2)
| sort - errors
```

The denominator is log events, not requests. This is only a request error rate if the logging contract emits exactly one counted event per request. Missing service fields or unparsed durations change the aggregation.

## Commands worth remembering

| Command | Job | Trap |
|---------|-----|------|
| `search` | Filter events by indexed/extracted fields | Boolean precedence differs from `where`; parenthesize mixed expressions |
| `where` | Evaluate an expression on fields | String literals need quotes |
| `stats` | Aggregate into rows | Original event fields disappear unless grouped/aggregated |
| `timechart` | Aggregate over time | Choose a useful span and understand series limits |
| `eval` | Derive fields | Nulls and type conversion can silently change results |
| `spath` | Extract structured JSON/XML paths | Prefer reliable ingestion-time/source-type configuration where appropriate |
| `rex` | Extract with a regex | Fragile when the event format changes |
| `table` | Select columns for final presentation | Avoid discarding fields needed by later processing |
| `dedup` | Retain representatives by field | Can hide repeated failures; it is not a count |

Correlate by a stable request/trace/job ID emitted by applications. Avoid broad `join` or `transaction` searches as a first response to every correlation problem; understand their memory, subsearch, and time limits first.

## Ingestion and alert checks

- Compare event time (`_time`) with index time (`_indextime`) to detect ingestion delay.
- Check host/source/source type, multiline boundaries, timestamp parsing, and time zones on sample events.
- Measure missing fields and volume changes before trusting dashboards.
- Give an alert a bounded schedule/window, trigger threshold, deduplication policy, owner, and actionable evidence.
- Review index retention, access roles, ingestion cost, and redaction at the producer/collection boundary.

An empty result can mean no failures, wrong search scope, broken extraction, or stopped ingestion. Confirm a known event traverses the pipeline.

## References

- [Splunk SPL command reference](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/9.4/overview/about-the-search-reference)
- [Splunk stats](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/9.4/search-commands/stats)
- [Splunk time modifiers](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/9.4/time-format-variables-and-modifiers/time-modifiers)

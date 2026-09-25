# CloudTrail and CloudWatch cheat sheet

> Baseline: AWS CloudTrail event history, CloudWatch metrics/logs, and Logs Insights QL. Reviewed: 2026-09-25.

Use CloudTrail to investigate supported AWS API activity and CloudWatch to inspect operational telemetry. Correlate them when a configuration change precedes a runtime failure.

Related: [AWS](aws.md), [observability](observability.md), [Splunk](splunk.md).

## Choose the evidence

| Question | Starting point | Limit |
|----------|----------------|-------|
| Who changed an AWS resource? | CloudTrail management events | Check account, Region, principal/session and event time |
| Who read/wrote an object or item? | Configured CloudTrail data events | Event history does not supply these by default |
| Is the service failing or slow? | CloudWatch metrics and alarms | Choose statistic, period, dimensions and missing-data behavior |
| Which request failed? | CloudWatch Logs / Logs Insights | Application must emit useful structured fields |
| Where was request time spent? | Distributed traces | Sampling and instrumentation can leave gaps |

CloudTrail event history covers the past 90 days of management events in a Region for an account. Longer retention, organization collection, and required data-event coverage need explicit trail/event-store configuration. Confirm selectors and delivery health rather than assuming all activity is recorded.

## Inspect recent changes

AWS CLI v2 with an authorized profile; replace the illustrative Region/profile and event name. Narrow the time window when investigating a specific incident.

```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=UpdateFunctionConfiguration \
  --profile engineering-dev --region us-west-2
```

Resolve assumed-role sessions to the initiating identity where evidence permits. Keep timestamps, request IDs, source address, error code, and resource identifiers together; names alone can be ambiguous.

## Logs Insights query

Run in the Logs Insights console after selecting the intended log groups and time range. Assumes structured application events with numeric `durationMs` and a bounded `service` field.

```text
fields @timestamp, service, durationMs
| filter ispresent(durationMs)
| stats count(*) as requests, pct(durationMs, 95) as p95Ms by bin(5m), service
```

This counts only events containing duration. Compare against expected request volume; missing telemetry can make a chart look healthy. Limit queried time and log groups to control scan volume. Do not place user IDs, request IDs, or arbitrary URLs in metric dimensions.

## Alarm and retention decisions

Alert on user-visible symptoms and sustained saturation, with an owner and response action. Define how missing metrics should be treated: a stopped producer and a healthy zero are different. Set log retention, access, encryption, and export policy explicitly. Keep credentials and full tokens out of log events; redaction after ingestion leaves an exposure window.

## References

- [CloudTrail event history coverage and limits](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html)
- [CloudWatch Logs Insights QL](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [CloudWatch missing-data alarm behavior](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

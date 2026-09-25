# DynamoDB cheat sheet

> Baseline: DynamoDB API and AWS CLI v2; examples use a fictional table and explicit Region/profile. Reviewed: 2026-09-25.

Design keys from access patterns. DynamoDB is not a relational schema with SQL joins removed.

Related: [AWS](aws.md), [distributed systems](distributed-systems.md), [caching](caching.md), [resilience](resilience.md).

## Model the access path

| Concept | Decision |
|---------|----------|
| Partition key | Spread traffic while keeping a useful query boundary |
| Sort key | Encode ordering/range access within a partition |
| GSI | Alternate query path; budget index writes/storage and eventual consistency |
| Conditional write | Enforce create-if-absent or expected-version updates atomically |
| Transaction | Coordinate bounded multi-item work when the invariant requires it |
| TTL | Eventual cleanup; expired items can remain visible until deletion |

Write down each operation's partition key, sort range, expected item count/size, consistency need, and peak traffic. A single heavily used tenant/key can become hot even when the table's total capacity looks sufficient.

## Query example

Assumes a table `ModelRuns` with string partition key `projectId` and sort key `runId`. Bash quoting; other shells may require file-based JSON arguments.

```bash
aws dynamodb query --table-name ModelRuns \
  --key-condition-expression 'projectId = :project' \
  --expression-attribute-values '{":project":{"S":"demo"}}' \
  --return-consumed-capacity TOTAL \
  --profile engineering-dev --region us-west-2
```

A `Query` requires partition-key equality and can constrain the sort key. Filters apply after reading; they do not reduce read capacity consumed. API pages can stop at 1 MB, and a filtered page can be empty while still returning `LastEvaluatedKey`. SDK callers continue using that key until absent. The CLI normally handles pagination unless its pagination controls change that behavior.

## Correctness under concurrency

- Use `attribute_not_exists` on the appropriate key for create-only writes; ordinary puts can overwrite existing items.
- Use a version attribute and condition expression for optimistic updates; handle conditional failure as a conflict.
- Choose strong reads when required and supported. Global secondary indexes provide eventually consistent reads.
- Retry throttling with bounded backoff/jitter; retry only unprocessed items in partial batch results.
- Define idempotency for commands whose success response may be lost.
- Filter expired TTL records in application reads when expiry must take effect immediately.

## Operability

Monitor throttling, latency, consumed capacity, errors, and hot-key symptoms. Review index projection size and write amplification. Test point-in-time recovery/restore procedures, including application cutover to a restored table. A backup does not include a tested traffic-switch procedure.

## References

- [DynamoDB query limits, capacity and consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Other.html)
- [DynamoDB conditional expressions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)
- [DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)

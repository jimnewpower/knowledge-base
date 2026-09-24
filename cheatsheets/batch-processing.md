# Batch processing and reliable imports cheat sheet

> Baseline: restartable import design; Spring Batch 5.2 terminology. Framework 6 APIs and migration requirements are outside this sheet. Reviewed: 2026-09-24.

A reliable import can explain **what was accepted, what failed, and where to resume** after interruption. Throughput matters only after those answers are trustworthy.

Related: [integration transformation](integration-transformation.md), [database migrations](database-migrations.md), [messaging](messaging-and-events.md), [Java concurrency](java-concurrency.md).

## Identify the work

| Concept | Meaning | Suggested policy |
|---------|---------|------------------|
| Job instance | Logical job plus identifying parameters | Identify the immutable input and intended processing version |
| Job execution | One attempt to run that instance | Restart the same logical work after failure |
| Step execution | One attempt at a processing step | Record counts, failure, and restart state |
| Execution context | Persisted restart metadata | Store stable checkpoints, not live connections or huge payloads |

Adding a fresh timestamp as an identifying parameter creates different logical work, not a restart. Keep retry attempts separate from input identity. See [Spring Batch domain concepts](https://docs.spring.io/spring-batch/reference/5.2/domain.html).

## Chunk the transaction

```text
immutable input -> read -> transform/validate -> write bounded chunk
                                                   |
                              business effects + checkpoint commit
                                                   |
                                             next chunk
```

Spring Batch's chunk model groups writes under a transaction. A larger chunk reduces commit overhead but increases rollback work, lock duration, and memory. Choose size from representative data, not a universal constant. See [chunk processing](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing.html).

If business writes and job metadata use different transaction resources, do not assume they commit atomically. Design for replay with stable item keys and idempotent effects. HTTP calls and emitted files need their own recovery protocol; a database rollback cannot undo them.

## File intake contract

Recommended handoff:

1. Producer finishes a temporary upload and publishes it using an agreed completion marker or supported atomic rename. Rename guarantees depend on the filesystem/protocol.
2. Consumer records immutable object identity/version, size, and checksum, then validates format and mapping version.
3. Assign a logical import ID and reject or deliberately version repeated submissions.
4. Checkpoint a stable record position/key. Preserve the source bytes through the recovery window.
5. Reconcile accepted, intentionally filtered, quarantined, and failed input records before marking completion.

A filename alone is weak identity. Resuming byte offsets after a file changes or under a different parser/encoding can silently skip or corrupt records.

## Filter, skip, retry, fail

| Outcome | Use for | Behavior to document |
|---------|---------|----------------------|
| Filter | Valid record intentionally excluded | Count separately from errors; a processor returning null filters an item |
| Skip | Known bad record allowed by the job contract | Quarantine reason/location and enforce an error budget |
| Retry | Transient failure with safe replay | Bound attempts and backoff; avoid retrying deterministic format errors |
| Fail | Broken assumptions or exhausted recovery | Stop with a durable checkpoint and actionable diagnosis |

An `ItemReader` returning null signals end of input, not a filtered record. Framework buffering, rollback, and retries can reprocess items; transformations and side effects must tolerate the configured replay behavior. Sources: [skip logic](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing/configuring-skip.html), [retry logic](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing/retry-logic.html).

## Restart and parallelism

Completed steps are normally skipped on restart; intentionally rerunning them needs explicit configuration and safe effects. Use the same identifying parameters and retained repository state. See [step restart](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing/restart.html).

Partition by stable, nonoverlapping ranges or input objects. Verify reader/writer thread safety; sharing a stateful reader across threads is not automatically safe. Bound workers to database, network, and memory capacity. Increasing a pool does not resolve SQLite's single-writer constraint.

## Suggested acceptance checks

- Kill the process around a chunk commit; restart and reconcile exact business results.
- Replay the same input and verify duplicate handling.
- Submit changed bytes under the same filename and reject accidental resume.
- Inject bad records, transient write failures, and unavailable external services.
- Verify that parallel partitions cover every intended record exactly as specified.

## References

- [Spring Batch 5.2 — domain concepts](https://docs.spring.io/spring-batch/reference/5.2/domain.html)
- [Spring Batch 5.2 — chunk processing](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing.html)
- [Spring Batch 5.2 — restarting steps](https://docs.spring.io/spring-batch/reference/5.2/step/chunk-oriented-processing/restart.html)
- [Spring Batch 5.2 — reader/writer implementations](https://docs.spring.io/spring-batch/reference/5.2/readers-and-writers/item-reader-writer-implementations.html)

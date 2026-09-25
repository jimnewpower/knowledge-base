# React Native offline data and synchronization cheat sheet

> Baseline: React Native application architecture, a transactional local database, and a versioned server sync protocol. Native background behavior depends on the deployed Android/iOS and React Native releases. Reviewed: 2026-09-24.

Render durable local state immediately, and make synchronization a restartable process. Network connectivity and application foreground state are hints, not delivery guarantees.

Related: [TypeScript](typescript.md), [SQLite](sqlite.md), [messaging](messaging-and-events.md), [resilience](resilience.md), [geospatial correctness](geospatial-correctness.md).

## Data flow

```text
User edit -> local transaction [entity change + outbox operation]
                           -> UI reads local state
Outbox worker -> authenticated API -> durable server result
                                   -> local acknowledgement transaction
Server changes -> paged delta feed -> local changes + checkpoint transaction
```

Do not keep the only copy of an edit in component state or an in-memory retry queue. Select storage with the transactions, migrations, capacity, and native support the data model needs. Small preference storage is not a substitute for an atomic entity-plus-outbox write.

## Define the sync contract

| Field or rule | Purpose |
|---------------|---------|
| Stable operation ID | Deduplicate retries after timeouts or process death |
| Entity ID and account scope | Prevent collisions and cross-account application |
| Base revision | Detect conflicting changes against the server's current version |
| Server-assigned result/revision | Record the authoritative outcome |
| Delta cursor | Resume a server-defined ordered change feed |
| Tombstone/retention policy | Propagate deletions and recognize clients needing a full resync |

Example outbox payload; names and semantics belong to your API, not a React Native standard. Keep the operation ID unchanged across retries and retain credentials outside this record.

```json validate
{
  "operationId": "6e4a4bfc-2c72-4c06-9b96-29156089acba",
  "entityId": "track-42",
  "baseRevision": 7,
  "kind": "renameTrack",
  "payload": { "name": "Morning route" }
}
```

The server must durably bind an operation ID to its request and result; reject reuse with a different payload. Retrying an accepted operation must not fail merely because its original base revision is now old. Coordinate deduplication, revision checking, and mutation atomically on the server.

## Conflict and recovery policy

- Choose per-entity behavior: merge independent fields, append immutable observations, reject stale edits, or request a user decision. Wall-clock “last write wins” can discard edits when device clocks differ.
- Apply each downloaded page and its checkpoint in one local transaction. Advance only after commit; duplicate replay must be harmless.
- Recover expired cursors with a defined resync that preserves pending local operations. Do not replace the local database blindly while edits are queued.
- Use bounded retry/backoff and distinguish transient failure, expired credentials, validation rejection, and conflict. Show pending and failed work explicitly.
- Serialize dependent operations or express their dependencies. A rename cannot assume an earlier create has reached the server.

## Mobile lifecycle and location

React Native `AppState` can trigger a foreground sync attempt; it does not grant background execution. Handle cancellation, process death, and resumption without assuming JavaScript timers keep running.

Android/iOS location collection in the background requires platform-specific permissions, lifecycle handling, and user-visible behavior. Separate durable recording from upload so a lost network does not lose observations. Bound local retention/storage, stop recording when requested, and handle permission revocation.

Scope local data and workers to the signed-in account. On account switching, prevent stale requests from applying results to the next user's store. Test airplane mode, lost acknowledgements, duplicates, clock skew, concurrent edits, full storage, and termination between each persistence step.

## References

- [Android offline-first data architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [React Native AppState](https://reactnative.dev/docs/appstate)
- [Android background location](https://developer.android.com/develop/sensors-and-location/location/background)
- [Apple background location updates](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background)

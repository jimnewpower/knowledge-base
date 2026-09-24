# Java date, time, and scheduling cheat sheet

> Baseline: Java 21 `java.time`; time-zone rules come from the deployed runtime's TZDB. Reviewed: 2026-09-24.

Separate a point on the timeline from a person's calendar intention. Persist enough information to reconstruct the intended behavior after a daylight-saving or time-zone rule change.

Related: [Java](java.md), [unit testing](junit-mockito-assertj.md), [batch processing](batch-processing.md), [Jackson](jackson-json.md).

## Select the type

| Type | Meaning | Example |
|------|---------|---------|
| `Instant` | Timeline point | Event received at the server |
| `LocalDate` | Calendar date without time/zone | Survey date |
| `LocalTime` | Clock time without date/zone | Recurring opening time |
| `LocalDateTime` | Local date and clock time | A proposed appointment requiring a zone/policy |
| `OffsetDateTime` | Date/time with a numeric offset | An API timestamp preserving its supplied offset |
| `ZonedDateTime` | Date/time resolved with regional zone rules | Appointment in `America/Denver` |
| `Duration` | Seconds/nanoseconds on a time-based scale | Timeout or elapsed interval |
| `Period` | Date-based years/months/days | Calendar recurrence step |
| `Clock` | Injectable source of current time and zone | Deterministic expiration tests |

An offset such as `-07:00` is not a region's future time-zone rules. Avoid the machine's default zone as an implicit business rule. Specify the zone at the display or scheduling boundary.

## Reject ambiguous local input explicitly

Method fragment with imports `java.time.LocalDateTime`, `java.time.ZoneId`, and `java.time.ZonedDateTime`. Policy: reject gaps and overlaps so the caller must choose another time or an explicit offset.

```java
static ZonedDateTime resolveUnique(LocalDateTime local, ZoneId zone) {
    var offsets = zone.getRules().getValidOffsets(local);
    if (offsets.size() != 1) {
        throw new IllegalArgumentException("Local time is missing or ambiguous in " + zone);
    }
    return ZonedDateTime.ofStrict(local, offsets.getFirst(), zone);
}
```

Ordinary `atZone` resolution has defaults: gaps move forward and overlaps generally choose the earlier offset. Those defaults may not match a booking or batch policy. For an overlap, accept a user-selected valid offset when the business permits both occurrences. See [ZonedDateTime](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/ZonedDateTime.html).

## Calendar schedules versus elapsed delays

- “Every day at 08:00 Denver time” requires a local recurrence, zone, and gap/overlap policy. Recompute the next occurrence; adding 24 hours to the last instant can shift the local time.
- `plusDays(1)` on a zoned date/time follows the calendar; `plusHours(24)` follows elapsed hours. Across a DST change they can differ.
- Use `System.nanoTime()` differences for elapsed measurements within one JVM; wall clocks can jump. Its value is not a persistable timestamp.
- A scheduler firing is not proof a job completed. Persist job identity, deduplicate overlapping/retried runs, and define missed-run behavior after downtime.
- A process-local scheduled executor does not coordinate replicas or survive restart. Its fixed-rate and fixed-delay modes have different cadence semantics.

## Storage and tests

Store event instants in a documented UTC representation. For future civil-time commitments, retain the original local time, zone, and resolution policy as well as any resolved instant. Preserve precision intentionally across JDBC/JSON boundaries.

Test just-before/at/after deadlines with `Clock.fixed`; include a gap, an overlap, a month end, and a zone different from the developer machine. Do not assume every calendar day has 24 hours or every month has the same length.

## References

- [Clock](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Clock.html)
- [Duration](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Duration.html)
- [ScheduledExecutorService](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html)

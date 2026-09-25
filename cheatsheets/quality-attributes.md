# Quality attributes and architecture review cheat sheet

> Baseline: measurable quality scenarios and lightweight architecture evaluation; example targets are illustrative, not production recommendations. Reviewed: 2026-09-24.

Translate “fast,” “reliable,” and “maintainable” into **scenarios with measurable outcomes**. A quality goal becomes useful when it can change a design choice and be checked.

Related: [ADRs](architecture-decisions.md)[^adr], [architecture styles](architecture-styles.md), [observability](observability.md), [resilience](resilience.md), [testing](testing.md).

## Write a quality scenario

| Field | Question | Illustrative example |
|-------|----------|----------------------|
| Source | Who or what triggers the situation? | Analyst |
| Stimulus | What happens? | Opens a saved project |
| Environment | Under which workload and conditions? | Network disabled; agreed reference workstation and fixture |
| Artifact | Which part of the system is affected? | Desktop project loader |
| Response | What must the system do? | Show saved metadata and allow local editing |
| Response measure | How will acceptance be judged? | At least 95% of 100 measured opens finish within 2 seconds, with no network dependency |

Specify fixture size, hardware, cold/warm cache policy, measurement boundaries, and correctness checks before using a timing target. This follows the scenario approach described in [arc42 quality requirements](https://docs.arc42.org/section-10/).

## Turn adjectives into checks

All numbers below are teaching examples. Agree real thresholds with stakeholders and test against a representative workload.

| Goal | Concrete scenario | Candidate evidence |
|------|-------------------|--------------------|
| Performance | At 50 concurrent users and a fixed dataset, p95 request latency stays below 300 ms and error rate below 1% | Load-test distribution, resource saturation, query plans |
| Recoverability | After losing the primary store, restore service within 30 minutes with at most 5 minutes of acknowledged data lost | Timed restore drill and record reconciliation |
| Resilience | A 10-minute catalog outage still permits opening and editing existing local projects | Fault injection and user-visible failure checks |
| Modifiability | A second catalog provider can be added within two engineer-days without changing scoring policy | Actual change exercise, diff, regression results |
| Security | A tenant-A identity cannot retrieve or alter tenant-B data through any supported API[^api] route | Authorization matrix and negative integration tests |
| Operability | An operator can identify which import failed and restart it without duplicate committed results | Runbook exercise, durable job states, deduplication checks |

RTO[^rto] is the recovery-time objective; RPO[^rpo] is the acceptable recovery-point gap. Neither is established by merely configuring backups. Verify the restored data and time the complete recovery path.

## Compare tactics and their costs

These are working design heuristics, not guarantees supplied by a framework.

| Tactic | Intended gain | Tradeoff to test |
|--------|---------------|------------------|
| Cache read results | Lower latency and origin load | Stale data, invalidation races, isolation of user-specific values |
| Queue expensive work | Shorter foreground requests, burst buffering | Queue delay, cancellation, duplicate work, backpressure |
| Replicate a service | Capacity and tolerance of instance loss | Shared dependencies, coordination, deployment consistency |
| Isolate a module behind an API | Easier change and focused tests | Mapping overhead and an API that needs stewardship |
| Add strict synchronous validation | Immediate correctness feedback | Latency and availability depend on each validator |
| Retry transient failures | Recover some failed operations | Load amplification and repeated side effects |

Compare alternatives against the same scenarios. A tactic that helps one attribute can harm another; write that tradeoff in the ADR.

## Lightweight review workflow

1. State the decision under review and hard constraints. Include what cannot change in the current system.
2. Select a few high-priority usage, failure, and change scenarios with stakeholders.
3. Walk those scenarios through the [C4 views](c4-diagrams.md)[^c4], contracts, data ownership, and deployment assumptions.
4. Identify uncertainty and propose the smallest useful evidence: prototype, load test, restore drill, dependency rule, or contract test.
5. Record the decision, accepted risk, owner, and revisit trigger. Track unresolved questions separately from established facts.

This is a lightweight review procedure for this collection, not a claim to have performed a formal ATAM[^atam] assessment.

## Make fitness checks executable

| Architectural intent | Check | What it does not prove |
|----------------------|-------|------------------------|
| Modules expose only approved APIs | Dependency/import rules in the build | That the chosen modules reflect the domain well |
| A contract remains compatible | Consumer/provider contract checks | Correct behavior for every production consumer |
| A workload meets its budget | Repeatable representative performance test | Capacity under all traffic patterns |
| Data survives recovery | Restore and reconciliation exercise | Every future migration is reversible |

Choose checks for costly regressions. Avoid turning unstable benchmarks into noisy gates or treating a coverage percentage as architecture evidence.

## Common measurement mistakes

- Reporting only averages when tail latency determines user experience.
- Excluding failed requests from the success story without reporting their rate.
- Measuring an empty database and generalizing to years of accumulated data.
- Claiming availability from replica count while all replicas share one failing dependency.
- Calling a design maintainable without trying a representative change.

## References

- [arc42 — quality requirements and scenarios](https://docs.arc42.org/section-10/)
- [arc42 — quality model and example requirements](https://quality.arc42.org/)

[^adr]: Architecture Decision Record.
[^api]: Application Programming Interface — the contract through which software components interact.
[^rto]: Recovery Time Objective — the target time to restore service.
[^rpo]: Recovery Point Objective — the acceptable amount of lost data, measured in time.
[^c4]: Context, Containers, Components, and Code — the four levels of the C4 architecture model.
[^atam]: Architecture Tradeoff Analysis Method.

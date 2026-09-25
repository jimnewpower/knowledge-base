# Linters, static analysis, SAST, and coverage cheat sheet

> Baseline: Maven/Java with JUnit 5, Mockito, JaCoCo, and project-pinned analysis tools; thresholds are repository policy. Reviewed: 2026-09-25.

Use each quality signal for the question it can answer. Coverage shows executed code, while assertions, review, and failure-path tests establish useful behavior.

Related: [JUnit and Mockito](junit-mockito-assertj.md), [testing](testing.md), [Maven](maven.md), [software supply chain](software-supply-chain.md).

## Choose the check

| Check | Typical tools | Detects / limit |
|-------|---------------|-----------------|
| Formatting/style | Checkstyle, Spotless, ESLint | Consistency; not semantic correctness |
| Static bug patterns | SpotBugs, PMD, Error Prone | Suspicious code paths/types; findings need context |
| SAST | CodeQL, Semgrep, security rules in analysis platforms | Potential source-to-sink issues; framework coverage varies |
| Dependency analysis | SCA/advisory scanner | Known component issues; distinct from source-code SAST |
| Test execution | JUnit, minimal Mockito at real boundaries | Behavior of exercised cases; mocks can conceal integration errors |
| Coverage | JaCoCo | Instruction/line/branch execution; not assertion quality |
| Mutation testing | PIT where useful | Whether tests detect selected artificial faults; runtime/cost tradeoff |

Pin tool versions and rule configuration. Run matching checks locally and in CI. Establish explicit owners for findings and distinguish new defects from an accepted legacy baseline.

## JaCoCo Maven wiring

| Goal / configuration | Purpose |
|----------------------|---------|
| `prepare-agent` | Set the JVM agent argument before unit tests |
| `report` | Produce HTML/XML from execution data and matching class files |
| `check` | Enforce configured counters and thresholds |
| Failsafe + integration agent/report | Collect integration coverage deliberately; avoid overwriting unit data |
| `report-aggregate` | Aggregate a deliberately structured multi-module reactor report |

Bind the required goals in the POM; `mvn verify` alone does not enable coverage. Preserve the injected agent argument if customizing Surefire/Failsafe `argLine`. A nonforking test setup (`forkCount=0`) will not attach the agent through the ordinary forked-JVM mechanism. Missing execution data must not masquerade as a passing coverage gate.

Working target for this collection: roughly 70% overall, stronger service/domain coverage, and lower expectations for UI wiring. Select meaningful counters and boundaries; do not exclude business logic to inflate a percentage. JaCoCo branch coverage does not count exception handling as branches, so test failure behavior explicitly.

## Make gates credible

1. Include checks in the same versioned build used by developers and CI.
2. Seed a deliberate failing test/rule violation while establishing the pipeline; confirm the required job fails.
3. Publish useful reports even on failure, with source/artifact identity.
4. Triage false positives with evidence, narrow suppression, owner and review trigger.
5. Revisit tests around escaped defects instead of only raising a global percentage.

## References

- [JaCoCo Maven integration](https://www.jacoco.org/jacoco/trunk/doc/maven.html)
- [JaCoCo counters](https://www.jacoco.org/jacoco/trunk/doc/counters.html)
- [SpotBugs Maven plugin](https://spotbugs.github.io/spotbugs-maven-plugin/)
- [CodeQL documentation](https://codeql.github.com/docs/)

# JUnit, Mockito, and AssertJ cheat sheet

> Baseline: Java 21, JUnit Jupiter 5.13, Mockito 5, and AssertJ 3.27. Use the JUnit BOM[^bom] and compatible Maven Surefire; JUnit 6 is a separate baseline. Reviewed: 2026-09-24.

A unit test should make a behavior easy to understand and a regression hard to hide. Keep fixtures small enough that the important input is visible beside the assertion.

Related: [TDD](tdd.md)[^tdd], [testing beyond the unit](testing.md), [Java time](java-time.md), [Maven](maven.md).

## Select the smallest useful tool

| Tool | Good use | Avoid |
|------|----------|-------|
| Plain objects | Pure rules, transformations, value objects | Starting Spring for arithmetic |
| Fake | Small stateful port, controllable clock/store | Reimplementing a database and trusting its transaction behavior |
| Mockito stub | Supply a collaborator's response or failure | Stubbing methods the test never calls |
| Argument captor | Inspect an outbound command after execution | Coupling tests to every internal call |
| Parameterized test | Boundary cases with one behavioral rule | A table of unrelated scenarios |
| Integration test | Framework wiring and external semantics | Pretending mocks verify SQL[^sql], serialization, or security configuration |

## Deterministic boundary test

Complete test class; requires `junit-jupiter` and `assertj-core` in test scope. The nested record is the small example under test. In an application, import its production counterpart.

Example abbreviations: UTC[^utc].

```java
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.assertj.core.api.Assertions.assertThat;

class ExpiryTest {
    record Expiry(Instant at) {
        boolean expired(Clock clock) {
            return !clock.instant().isBefore(at);
        }
    }

    @ParameterizedTest
    @CsvSource({"-1,false", "0,true", "1,true"})
    void expiryIncludesTheBoundary(long offsetSeconds, boolean expected) {
        var deadline = Instant.parse("2026-09-24T12:00:00Z");
        var clock = Clock.fixed(deadline.plusSeconds(offsetSeconds), ZoneOffset.UTC);

        var actual = new Expiry(deadline).expired(clock);

        assertThat(actual).isEqualTo(expected);
    }
}
```

Use `@MethodSource` for richer inputs; prefer explicit expected values over calculating them with the same algorithm as production. Assert exception type and a stable property when rejecting invalid input; avoid pinning incidental punctuation in messages.

## Mockito discipline

Use `MockitoExtension` for Jupiter-managed mocks and constructor injection for the subject. Stub only the boundary needed by the scenario. For spies, `when(spy.method())` executes the real method while stubbing; `doReturn(...).when(spy).method()` avoids that execution when a spy is justified.

Verify calls when the call **is** the outcome, such as emitting one command with a specific idempotency key. Prefer result/state assertions for ordinary calculations. `verifyNoMoreInteractions` on every collaborator freezes implementation details and makes harmless refactoring expensive. Keep strict stubbing enabled unless a specific test has a documented reason otherwise.

## Asynchronous and shared-state tests

- Prefer a controllable executor or a completion signal over `Thread.sleep`.
- Bound waits; a test timeout is a safety limit, not evidence that the result is correct.
- Close executors/resources and restore modified global state. Parallel tests amplify static-state leaks.
- Check failure and cancellation paths where they affect ownership or persisted state.
- Test the real boundary separately when a fake's assumptions matter: uniqueness, transaction rollback, JSON[^json] mapping, or HTTP[^http] status handling.

## References

- [JUnit 5 user guide](https://docs.junit.org/5.13.4/user-guide/)
- [Mockito API](https://javadoc.io/doc/org.mockito/mockito-core/5.18.0/org.mockito/org/mockito/Mockito.html)[^api]
- [AssertJ documentation](https://assertj.github.io/doc/)

[^bom]: Bill of Materials — a dependency-version catalog in Maven.
[^tdd]: Test-Driven Development.
[^sql]: Structured Query Language.
[^json]: JavaScript Object Notation.
[^http]: Hypertext Transfer Protocol.
[^api]: Application Programming Interface — the contract through which software components interact.
[^utc]: Coordinated Universal Time.

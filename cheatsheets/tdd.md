# TDD[^tdd] cheat sheet

> Baseline: Test-driven development with Java 21, JUnit Jupiter 5.x, and Maven Surefire/Failsafe. Reviewed: 2026-09-24.

Test-driven development is a **design loop**, not a test-volume contest.

```text
red   → write one failing test that names a behavior
green → write the minimum code that passes
refactor → clean the design while tests stay green
```

If there is no failing test first, it is “tests after,” which is still valuable and is not TDD.

See [clean-code-and-solid.md](clean-code-and-solid.md) and [java.md](java.md).

## What the next test should say

Name the behavior, not the method.

```java
@Test
void submitRejectsEmptyOrder() {
    var order = Order.empty();
    assertThrows(InvalidOrder.class, order::submit);
}
```

One behavior per test. Multiple assertions are fine when they check one outcome.

## JUnit 5 sketch

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderTest {
    @Test
    void submitMovesDraftToOpen() {
        var order = Order.draft(new OrderId("1"));
        order.add(Line.sku("ABC-0001", 1));
        order.submit();
        assertEquals(Status.OPEN, order.status());
    }
}
```

| Tool | Role |
|------|------|
| JUnit 5 | test runner |
| AssertJ | fluent assertions when built-in `assert*` gets noisy |
| Mockito | replace a neighbor you do not want to boot |
| Testcontainers | real DB[^db]/broker when the behavior *is* the integration |

Maven: Surefire runs `*Test`; Failsafe runs `*IT`[^it]. Keep unit tests off the network.

## Test doubles

| Double | Meaning |
|--------|---------|
| Dummy | Passed but never used |
| Stub | Returns canned data |
| Fake | Working in-memory stand-in (in-memory repo) |
| Mock | Object you assert *was called* a certain way |
| Spy | Partial real object |

Prefer fakes for repositories. Mocks shine at interaction-heavy boundaries (a mailer that must not send twice). Over-mocked tests lock in collaboration details and shatter on refactors.

## What to test

| Worth a test | Usually not |
|--------------|-------------|
| Invariants and domain rules | Getters with no logic |
| Parsing and mapping at boundaries | Framework wiring you cannot break without CI[^ci] failing anyway |
| Error paths you claim to handle | Generated code |
| Regression for a production bug | Private methods directly — test them through the contract |

A regression test that reproduces a bug before the fix gives evidence that the fix addresses it and protects against recurrence. When reproduction cannot be automated economically, record how the fix was verified and the remaining risk.

## Outside-in vs inside-out

- **Inside-out:** start at a domain object, grow outward. Natural for rich invariants.
- **Outside-in:** start at the HTTP[^http] handler with a failing API[^api] test, invent collaborators as you go. Natural for API work.

Both are TDD. Pick based on where the uncertainty is.

## Red-green discipline

1. Watch the new test fail for the *right reason* (assertion, not compile typo).
2. Resist implementing the next feature while green-ing this one.
3. Refactor only on green. Do not add behavior in the refactor step.
4. If green is hard, the unit is too big or too coupled — that is the design signal.

## Coverage and CI

Coverage tells you what never ran. It does not tell you it was right. Gate on tests passing, not on a vanity percentage. Cover the branches that encode money, identity, and authorization.

## Gotchas

- Tests that depend on wall-clock `now` without a clock port.
- Tests that share a mutable static or a leftover DB row.
- `@SpringBootTest` for every class. That is an integration suite; keep a fast unit layer.
- Asserting on full JSON[^json] strings when you care about one field.
- TDD theater: writing the code, then a test that mirrors it line for line, then claiming the loop.

## References

- [Martin Fowler — test-driven development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [JUnit 5 — user guide](https://docs.junit.org/5.11.4/user-guide/)

[^tdd]: Test-Driven Development.
[^db]: Database.
[^it]: Integration Test — the Maven test-name suffix used here.
[^ci]: Continuous Integration.
[^http]: Hypertext Transfer Protocol.
[^api]: Application Programming Interface — the contract through which software components interact.
[^json]: JavaScript Object Notation.

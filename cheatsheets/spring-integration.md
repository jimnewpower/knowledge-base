# Spring Integration in practice cheat sheet

> Baseline: Java 21, Spring Integration 6.5 and Spring Framework 6.2; compatible with the Spring Boot 3.5 line. Reviewed: 2026-09-24.

Use Spring Integration to implement message flows inside an application. Channel choice determines execution and failure behavior; a diagram alone does not establish durability.

Related: [Enterprise Integration Patterns](enterprise-integration-patterns.md), [routing and coordination](integration-routing-and-coordination.md), [transformation](integration-transformation.md), [messaging](messaging-and-events.md).

## Translate the vocabulary

| Building block | Purpose | Decision to make |
|----------------|---------|------------------|
| Message | Payload plus headers | Identity, correlation, metadata ownership |
| Channel | Connect endpoints | Threading, capacity, delivery semantics |
| Adapter | One-way interaction with an external system | Polling/listening, acknowledgment, restart |
| Gateway | Request/reply boundary or Java interface facade | Reply timeout and error mapping |
| Transformer | Produce a new representation | Schema/version and validation policy |
| Service activator | Invoke application behavior | Transaction and idempotency boundary |
| Poller | Schedule reads from a pollable source/channel | Batch size, executor, transaction, backoff |

## Thread and failure semantics

| Channel | Execution | Main implication |
|---------|-----------|------------------|
| `DirectChannel` | Calling thread | Synchronous failure can reach the sender; same-thread transaction context can apply |
| `ExecutorChannel` | Configured executor | Thread handoff; caller's transaction does not automatically cross it |
| `QueueChannel` | Sender enqueues, receiver later dequeues | Capacity creates backpressure; default in-memory queue is not durable |
| `PublishSubscribeChannel` | Each subscriber, optionally using an executor | Fan-out does not mean atomic success across subscribers |

Configure bounded queues/executors and explicit send/reply time budgets. A blocked sender is part of the load model. See [channel implementations](https://docs.spring.io/spring-integration/reference/6.5/channel/implementations.html).

## Small Java DSL[^dsl] flow

Complete configuration class except imports; requires `spring-integration-core` and a Spring application context. Imports: Spring `Bean`, `Configuration`, Integration `EnableIntegration`, `IntegrationFlow`, `DirectChannel`, `QueueChannel`, and `java.util.Locale`.

```java
@Configuration
@EnableIntegration
class TextFlow {
    @Bean
    DirectChannel raw() {
        return new DirectChannel();
    }

    @Bean
    QueueChannel normalized() {
        return new QueueChannel(100);
    }

    @Bean
    IntegrationFlow normalize() {
        return IntegrationFlow.from(raw())
            .<String, String>transform(text -> text.strip().toUpperCase(Locale.ROOT))
            .channel(normalized())
            .get();
    }
}
```

This deliberately exposes a pollable output for the caller to drain. It has no external adapter, persistence, or automatic consumer. A continuously running service needs a consumer/poller. Configure the endpoint's downstream send timeout when filling a bounded output; a timeout passed to the input channel is not a universal deadline for the whole flow.

## Transactions, errors, and recovery

Synchronous exceptions normally propagate to the caller. Asynchronous infrastructure can publish an `ErrorMessage` to a message-specific or global error channel; configure and test its handler. An error channel is not automatically a durable dead-letter store.

Place transaction advice on the actual poller/endpoint boundary. A database rollback does not undo an HTTP[^http] request, and dequeuing from an ordinary in-memory queue does not make the message recoverable. For durable delivery, choose a persistent store or broker and define acknowledgment, retry exhaustion, quarantine, and replay behavior.

Test duplicate input, downstream failure, queue saturation, and process restart. Use the existing EIP[^eip] sheets to choose patterns before expressing them as DSL steps.

## References

- [Java DSL](https://docs.spring.io/spring-integration/reference/6.5/dsl.html)
- [Error handling](https://docs.spring.io/spring-integration/reference/6.5/error-handling.html)
- [Transaction support](https://docs.spring.io/spring-integration/reference/6.5/transactions.html)

[^dsl]: Domain-Specific Language.
[^http]: Hypertext Transfer Protocol.
[^eip]: Enterprise Integration Patterns.

# Log4j 2 configuration cheat sheet

> Baseline: Log4j 2.x API/Core, Java 21, and XML configuration; pin compatible maintained versions in the application. Reviewed: 2026-09-25.

Use this when configuring Java logs, diagnosing duplicate events, or carrying request context. Start with [observability](observability.md) for signal design and alerting.

Related: [Java libraries](java-libraries.md), [OpenTelemetry and Micrometer](opentelemetry-micrometer.md), [Java concurrency](java-concurrency.md).

## Configuration ownership

The application selects the implementation and configuration. Align `log4j-api` and `log4j-core`; inspect competing providers and bridges. Framework starters may already supply another implementation. Put `log4j2.xml` on the runtime classpath or select an explicit configuration file. See [configuration](https://logging.apache.org/log4j/2.x/manual/configuration.html).

## Rolling files

Complete XML configuration. The process must be allowed to write `logs` relative to its working directory; installed applications should choose an explicit application-data location. Archive count is bounded; a large event can exceed the nominal rollover size.

```xml validate
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
  <Appenders>
    <RollingFile name="Application" fileName="logs/application.log"
                 filePattern="logs/application-%i.log.gz">
      <PatternLayout pattern="%d{ISO8601} %-5level [%t] %logger - %msg%n%throwable"/>
      <Policies>
        <SizeBasedTriggeringPolicy size="10 MB"/>
      </Policies>
      <DefaultRolloverStrategy max="5"/>
    </RollingFile>
  </Appenders>
  <Loggers>
    <Root level="info">
      <AppenderRef ref="Application"/>
    </Root>
  </Loggers>
</Configuration>
```

Use console output when the runtime collects stdout. Date-based archive names need an explicit deletion policy; a per-period index limit does not bound total retention. See [rolling file appenders](https://logging.apache.org/log4j/2.x/manual/appenders/rolling-file.html).

## Context and duplicates

Scope and clear Thread Context after work. Capture/install it across executor boundaries instead of assuming thread-local values follow tasks. See [Thread Context](https://logging.apache.org/log4j/2.x/manual/thread-context.html).

Additivity can deliver an event to both a named logger's appenders and its ancestors. Inspect routing before attaching the same destination repeatedly. Handle and log exceptions at an appropriate boundary, preserving stack traces.

## Verification

Check effective configuration, writable paths, rotation, stack traces, and shutdown in the packaged application. Exercise disk-full/permission failures. Exclude secrets and bound untrusted messages. Use structured output when consumers need reliable fields.

The automated check validates XML well-formedness only. Runtime loading, event routing, and rollover need integration tests in the consuming application.

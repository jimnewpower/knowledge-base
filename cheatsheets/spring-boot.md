# Spring Boot cheat sheet

Spring Boot is the default way this collection’s Java services are wired: auto-configuration, an embedded server, and a component scan over your code.

Related: [java.md](java.md), [maven.md](maven.md), [rest-apis.md](rest-apis.md), [testing.md](testing.md).

## What Boot actually is

- **Spring Framework** — DI, AOP, transactions, MVC.
- **Spring Boot** — opinions + starter JARs + `SpringApplication` so you do not assemble that by hand.
- **Spring Data / Security / Cloud** — optional modules. Do not add them until you have the problem.

```java
@SpringBootApplication
public class OrderApplication {
  public static void main(String[] args) {
    SpringApplication.run(OrderApplication.class, args);
  }
}
```

`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` on the package and below. Put the application class in the parent package of your code.

## Module layout

```text
com.example.order
  OrderApplication
  api            # HTTP adapters
  app            # use cases
  domain
  adapter.db
```

Scan stays at `com.example.order`. Adapters depend inward. See [design-patterns.md](design-patterns.md) (hexagonal).

## Configuration

```yaml
# application.yml
spring:
  application:
    name: order-service
server:
  port: 8080
```

```yaml
# application-prod.yml
spring:
  datasource:
    url: ${JDBC_URL}
```

```bash
java -jar app.jar --spring.profiles.active=prod
```

| Source (later wins, simplified) | Example |
|---------------------------------|---------|
| `application.yml` | defaults |
| `application-{profile}.yml` | env overlay |
| Environment variables | `SPRING_DATASOURCE_URL` |
| Command-line args | `--server.port=8081` |

`@ConfigurationProperties(prefix = "order")` on a typed record/class beats a pile of `@Value`. Fail boot if required properties are missing.

## Components

| Annotation | Role |
|------------|------|
| `@Component` | generic bean |
| `@Service` | application/domain service |
| `@Repository` | persistence adapter (also translates exceptions) |
| `@Controller` / `@RestController` | HTTP |
| `@Configuration` + `@Bean` | explicit wiring |

Constructor injection only. A single constructor does not need `@Autowired`.

```java
@RestController
@RequestMapping("/api/v1/orders")
class OrderController {
  private final CloseOrder closeOrder;
  OrderController(CloseOrder closeOrder) { this.closeOrder = closeOrder; }
}
```

## Web

```java
@GetMapping("/{id}")
OrderResponse get(@PathVariable String id) { ... }

@PostMapping
ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrder req) { ... }

@ExceptionHandler(OrderNotFound.class)
ResponseEntity<ErrorBody> missing(OrderNotFound ex) {
  return ResponseEntity.status(404).body(ErrorBody.of("not_found", ex.getMessage()));
}
```

Validation: `spring-boot-starter-validation` + `@Valid`. Return HTTP status from `@ControllerAdvice`, not from business types.

## Data

`spring-boot-starter-jdbc` or `data-jpa`. Prefer explicit SQL / MyBatis when the schema is the contract. JPA is fine for simple aggregates; it is not a substitute for knowing the SQL.

```java
@Transactional
public void close(OrderId id) { ... }
```

Transaction advice lives on public methods of Spring proxies. Self-invocation does not go through the proxy.

## Actuator

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Expose `health` (and maybe `info`) publicly. Keep `env`, `beans`, `heapdump` off the public network.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      probes:
        enabled: true
```

Liveness vs readiness: see [observability.md](observability.md) and [kubernetes-openshift.md](kubernetes-openshift.md).

## Testing (Boot-shaped)

| Annotation | Boots |
|------------|--------|
| `@SpringBootTest` | almost everything — slow, use sparingly |
| `@WebMvcTest` | MVC slice + mocks |
| `@DataJdbcTest` / `@DataJpaTest` | persistence slice |
| `@JsonTest` | Jackson |

Details in [testing.md](testing.md).

## Gotchas

- Component scan from the wrong package “loses” beans.
- Two `@Bean` methods of the same type without `@Qualifier` or `@Primary`.
- Field injection in tests and production hides required dependencies.
- `spring.main.allow-bean-definition-overriding=true` papers over name clashes.
- Starters pull a lot of transitive JARs. Run `mvn dependency:tree` when versions drift.

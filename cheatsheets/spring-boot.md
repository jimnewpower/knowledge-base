# Spring Boot cheat sheet

> Baseline: Spring Boot 3.5 / Framework 6.2 / Java 21 examples; consult migration guidance before copying into Boot 4. Reviewed: 2026-09-24.

Spring Boot is the default way this collection’s Java services are wired: auto-configuration, an embedded server, and a component scan over your code.

Related: [java.md](java.md), [maven.md](maven.md), [rest-apis.md](rest-apis.md), [testing.md](testing.md), [JPA and Hibernate](jpa-and-hibernate.md), [Java/Jakarta modernization](java-jakarta-modernization.md).

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

`@ConfigurationProperties(prefix = "order")` on a typed record/class beats a pile of `@Value`. Register it with configuration-properties scanning or `@EnableConfigurationProperties`; use `@Validated` and appropriate constraints to fail boot for missing required values.

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

Controller/advice method sketches; domain DTOs and service bodies are omitted:

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

Put transaction boundaries on service methods invoked through Spring-managed proxies. Public methods are the portable convention; Spring 6+ class-based proxies also support protected/package-visible methods by default, while interface proxies require public interface methods. Private methods and self-invocation are not advised in proxy mode. AspectJ weaving has different rules.

## Actuator

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Expose only the health information clients need. Keep diagnostic endpoints and Prometheus scraping on authenticated or private management paths. The configuration below selects endpoints; it does not secure them. `prometheus` also requires `micrometer-registry-prometheus`.

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

## References

- [Spring Boot 3.5 — reference documentation](https://docs.spring.io/spring-boot/3.5/reference/)
- [Spring Framework 6.2 — transactional method visibility and proxies](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/annotations.html)

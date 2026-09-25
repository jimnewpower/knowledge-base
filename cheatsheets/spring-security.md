# Spring Security configuration cheat sheet

> Baseline: Java 21, Spring Boot 3.5 / Framework 6.2 / Security 6.5, servlet applications. Boot 4 / Security 7 require a separate migration check. Reviewed: 2026-09-24.

Choose the credential model first, then make filter-chain coverage and authorization explicit.

Related: [authentication](authentication.md), [authorization](authorization.md), [application security](application-security.md), [Spring Boot](spring-boot.md).

## Configuration boundaries

| Mechanism | Responsibility | Common mistake |
|-----------|----------------|----------------|
| `securityMatcher` | Select which requests a filter chain handles | Leaving requests outside every chain |
| `requestMatchers` | Authorize requests within the selected chain | Broad rule hiding a later narrow rule |
| `@EnableMethodSecurity` | Enable service-method authorization | Assuming annotations activate themselves |
| `@PreAuthorize` | Check an invocation through a Spring proxy | Self-invocation bypassing the proxy |
| CORS[^cors] | Browser cross-origin access policy | Treating it as authentication |
| CSRF[^csrf] protection | Resist forged requests using ambient credentials | Disabling it because an endpoint returns JSON[^json] |

The first matching chain handles the request; chains do not accumulate. Within a chain, authorization rules are evaluated in order. Use a final catch-all chain when defining specialized chains. See [request authorization](https://docs.spring.io/spring-security/reference/6.5/servlet/authorization/authorize-http-requests.html).

## Session-based application

Configuration-class fragment; requires `spring-boot-starter-security`, servlet web support, and an application-provided user store or identity provider. The annotations belong on the enclosing class. Imports are omitted.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfiguration {
    @Bean
    SecurityFilterChain web(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .build();
    }
}
```

This keeps CSRF protection enabled. Forms and AJAX[^ajax] writes must send the token; account for session expiry and token refresh after login/logout. `hasRole("ADMIN")` checks the `ROLE_ADMIN` authority. The public health endpoint should expose only the intended health summary.

## Bearer-token APIs[^api]

- Use resource-server support to validate issuer, signature, expiry, and the audience required by your API. Merely decoding a JWT[^jwt] establishes no trust.
- Scope authorities commonly map to `SCOPE_name`; role claims need an explicit converter when the provider uses a different model.
- Stateless session policy does not itself justify disabling CSRF. Evaluate whether cookies, HTTP[^http] Basic, or another automatically attached credential can authenticate requests.
- Configure CORS for the real frontend origins and credential policy. Allowing preflight must not make the underlying operation public.

## Prove the policy

Use `spring-security-test` with the real filter chain: anonymous access, ordinary user, administrator, wrong tenant/object owner, and expired/invalid credentials. For session writes, test both missing CSRF token and `.with(csrf())`.

`@WithMockUser` tests authorization with a synthetic principal; it does not prove password verification, JWT validation, or provider claim mapping. Include separate authentication-boundary checks. Expect redirects for a form-login entry point and typically 401/403 responses for an API configured that way; do not assume all chains behave alike.

## References

- [Servlet security architecture](https://docs.spring.io/spring-security/reference/6.5/servlet/architecture.html)
- [CSRF protection](https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html)
- [JWT resource servers](https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html)
- [MockMvc security testing](https://docs.spring.io/spring-security/reference/6.5/servlet/test/mockmvc/index.html)

[^cors]: Cross-Origin Resource Sharing.
[^csrf]: Cross-Site Request Forgery.
[^json]: JavaScript Object Notation.
[^ajax]: Asynchronous JavaScript and Extensible Markup Language — browser requests that update part of a page without a full reload; payloads need not use that markup format.
[^api]: Application Programming Interface — the contract through which software components interact.
[^jwt]: JSON Web Token; JSON means JavaScript Object Notation.
[^http]: Hypertext Transfer Protocol.

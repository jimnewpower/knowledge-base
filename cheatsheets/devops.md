# DevOps cheat sheet

> Baseline: Java/Maven delivery to containers; deployment policies depend on the operating environment. Reviewed: 2026-09-24.

DevOps here means **making delivery and operations part of the software design**: build, test, package, promote, observe, recover. It is not a job title and not “we installed Jenkins.”

Related: [maven.md](maven.md), [docker.md](docker.md), [git.md](git.md), [distributed-systems.md](distributed-systems.md).

## The loop

```text
change → build → test → package → deploy → observe → back to change
```

Every stage should be a command a machine can run. If it only lives on someone’s laptop, it is not the pipeline.

## CI vs CD

| Term | Meaning |
|------|---------|
| Continuous integration | Every change builds and is tested on a shared trunk-like line |
| Continuous delivery | Main is always *deployable*; promotion is a decision |
| Continuous deployment | Every green main goes to production automatically |

Most governed environments want **delivery**, not unsupervised deployment. The pipeline still has to prove the artifact is the same one you tested.

## Pipeline skeleton (Java)

```text
1. checkout (including the Git SHA)
2. ./mvnw -q verify
3. static analysis + test reports
4. package jar / image
5. scan image and dependencies (SBOM)
6. push artifact tagged with SHA and version
7. deploy to a non-prod environment
8. smoke / contract tests against that environment
9. promote the same digest
```

Do not rebuild for production. Promote the artifact from step 6.

## Quality gates that pay rent

- Compiler + unit tests
- Integration tests against a real-enough dependency (Testcontainers, ephemeral schema)
- Lint / static analysis with a fixed baseline
- Dependency vulnerability scan with an explicit exception process
- Contract tests for public APIs
- A smoke test after deploy (`GET /actuator/health`, one authenticated write)

Coverage percentage is a weak gate by itself. Cover the invariants.

## Environments and config

```text
local → ci → dev/test → staging → prod
```

- Same image in every environment.
- Config via env or mounted files, not rebuilt binaries.
- Secrets from a secret manager or platform injection, never from Git.
- Database migrations are forward-only and compatible with the currently running old app (expand/contract).

## Infrastructure as code

Terraform, Helm, Kustomize, Ansible — pick what the platform already uses. The rule is the same: the desired state is in Git, applied by CI with a plan/diff, not clicked in a console.

Treat platform modules like libraries: versioned, reviewed, not forked per app without a reason.

## Observability

| Signal | Use |
|--------|-----|
| Logs | Discrete events; structured JSON; no secrets |
| Metrics | RED/USE: rate, errors, duration; saturation |
| Traces | One request across processes |
| Health | Liveness vs readiness are different |

Alert on user-visible failure and budget burn, not on every CPU blip.

## Operations habits

- Runbooks next to the service: start, stop, rollback, rotate a secret. Create `runbooks/` when the first actual runbook is ready, then link it.
- Rollback is a first-class pipeline action (previous image digest)
- Feature flags for risky behavior; they need an owner and an expiry
- On-call without dashboards is theater

## Gotchas

- “Works on my machine” plus a different JDK in CI. Use the wrapper and a pinned image.
- Deploying SNAPSHOT jars to shared environments. Pin versions.
- Snowflake prod that drifted from IaC. The console change will win until it is imported or destroyed.
- Health checks that hit the database on every kube probe and then take the app down.
- Treating OpenShift/K8s YAML as an implementation detail nobody reviews.

## References

- [DORA — continuous delivery capability](https://dora.dev/capabilities/continuous-delivery/)
- [Docker — image digests](https://docs.docker.com/dhi/core-concepts/digests/)

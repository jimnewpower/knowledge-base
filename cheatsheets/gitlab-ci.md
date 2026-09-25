# GitLab CI[^ci]/CD[^cd] for Maven cheat sheet

> Baseline: GitLab CI YAML[^yaml] with a configured Linux shell runner using JDK[^jdk] 21; exact server/runner features depend on the deployed version. Reviewed: 2026-09-25.

Separate branch/merge-request verification from protected release authority. Pipeline configuration and runner access are part of the trust boundary.

Related: [Jenkins](jenkins.md), [GitHub Actions](github-actions-maven.md), [Maven](maven.md), [secrets management](secrets-management.md).

## Verification pipeline

Example `.gitlab-ci.yml` for a Maven application. Configure a dedicated runner tagged `linux-jdk21` with a pinned JDK/toolchain and isolated clean workspaces. Commit executable `mvnw`, wrapper configuration, and LF[^lf] line endings. A Docker/Kubernetes runner needs an explicit reviewed image in addition to suitable tags.

```yaml validate
workflow:
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS && $CI_PIPELINE_SOURCE == "push"'
      when: never
    - if: '$CI_COMMIT_BRANCH'
    - if: '$CI_COMMIT_TAG'

stages: [verify]

verify:
  stage: verify
  tags: [linux-jdk21]
  timeout: 20m
  script:
    - ./mvnw --batch-mode --no-transfer-progress verify
  artifacts:
    when: always
    expire_in: 7 days
    reports:
      junit:
        - '**/target/surefire-reports/TEST-*.xml'
        - '**/target/failsafe-reports/TEST-*.xml'
    paths:
      - '**/target/surefire-reports/'
      - '**/target/failsafe-reports/'
```

The workflow avoids a duplicate push pipeline for a branch with an open merge request while allowing its merge-request pipeline. Adjust explicitly for schedules, API[^api]-triggered jobs, and child pipelines. This example does not itself define deployment or release permissions.

## Keywords and behavior

| Keyword | Meaning / caution |
|---------|-------------------|
| `rules` | First matching rule controls inclusion/behavior; test relevant pipeline sources |
| `needs` | Dependency graph and artifact-download selection; can bypass stage ordering |
| `artifacts` | Pass/retain build outputs and reports with an expiry/access policy |
| `cache` | Reusable acceleration, not authoritative release output |
| `resource_group` | Serialize jobs targeting the same mutable deployment environment |
| `allow_failure` | Can permit a pipeline to pass with a failed job; avoid on required gates |

## Promotion and trust

Use protected refs/environments and narrowly scoped credentials for release jobs. A tag name alone does not establish trusted source. Validate federation issuer/audience/subject restrictions if using CI identity tokens. Keep untrusted code off persistent privileged runners and avoid exposing protected variables through manually triggered pipelines on unreviewed changes.

Use GitLab CI Lint for the exact server version and included configuration, then exercise branch, merge-request, tag, and deliberate failure paths. Promote the verified artifact digest with its SBOM[^sbom] and reports.

## References

- [GitLab CI YAML reference](https://docs.gitlab.com/ci/yaml/)
- [GitLab workflow rules](https://docs.gitlab.com/ci/yaml/workflow/)
- [GitLab pipeline security](https://docs.gitlab.com/ci/pipeline_security/)

[^ci]: Continuous Integration.
[^cd]: Continuous Delivery or Continuous Deployment; delivery keeps changes releasable, while deployment automatically releases them to production.
[^yaml]: YAML Ain't Markup Language — a recursive acronym naming a data-serialization format.
[^jdk]: Java Development Kit.
[^lf]: Line Feed — the newline character used by Unix-style text files.
[^api]: Application Programming Interface — the contract through which software components interact.
[^sbom]: Software Bill of Materials.

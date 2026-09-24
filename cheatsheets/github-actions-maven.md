# GitHub Actions for Maven delivery cheat sheet

> Baseline: Java 21, a committed Maven Wrapper, Linux GitHub-hosted runners, and the reviewed action revisions below. Reviewed: 2026-09-24.

Make pull-request checks reproducible and keep publication authority in a separately controlled release path.

Related: [Maven](maven.md), [DevOps](devops.md), [software supply chain](software-supply-chain.md), [testing](testing.md).

## Minimal verification workflow

Example `.github/workflows/verify.yml` for a Maven application, not for this Markdown repository. Commit `mvnw` with LF line endings and its executable bit, plus the wrapper configuration. Replace the runner image only after checking your toolchain requirements.

```yaml
name: Verify
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          persist-credentials: false
      - uses: actions/setup-java@cf277c60eb25467037889841efdb72551f06f6c3 # v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - run: ./mvnw --batch-mode --no-transfer-progress verify
      - name: Test reports
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: test-reports
          path: |
            **/target/surefire-reports/**
            **/target/failsafe-reports/**
          retention-days: 7
```

These are full commit pins for reviewed v4 revisions, not a claim that v4 is the latest major. Update pins through reviewed dependency changes. Pinning the action does not freeze the runner image, downloaded JDK patch, or external package repositories.

## Trust boundaries

| Event or input | Rule |
|----------------|------|
| Pull-request code | Treat scripts, Maven plugins, and tests as executable untrusted input |
| `pull_request_target` | Do not check out and execute untrusted PR code with privileged credentials |
| PR title/body/branch | Pass through an environment variable if needed; do not interpolate into shell source |
| Cache | An optimization; do not treat a cache hit as artifact verification |
| Release job | Grant only needed permissions; prefer short-lived credentials where supported |
| Self-hosted runner | Isolate trust levels and clean state; do not expose a persistent privileged machine to arbitrary PRs |

Keep test reports useful without publishing credentials, private fixtures, or unrestricted request dumps. Fork PRs have different token/secret availability; checks should handle this explicitly rather than silently skipping meaningful verification.

## Build and promote

1. Pin wrapper, plugin, and dependency versions; enforce toolchain requirements in Maven.
2. Make Surefire/Failsafe and any coverage/static-analysis gates part of `verify`; invoking the phase alone does not configure those plugins.
3. Identify release outputs by commit and immutable digest; retain their test results, SBOM, and provenance.
4. Promote those exact outputs through environments. Rebuilding from the same source can still change dependencies or tooling.
5. Apply protected branches/tags and environment gates to publishing jobs. Grant token write permissions only there.

Run a deliberate failing test once when establishing the pipeline to prove that its required check actually blocks delivery.

## References

- [Building and testing Java with Maven](https://docs.github.com/en/actions/tutorials/build-and-test-code/java-with-maven)
- [Secure use of GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [setup-java](https://github.com/actions/setup-java)
- [Maven lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)

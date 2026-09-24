# Dependency and software supply-chain security cheat sheet

> Baseline: Maven/Java delivery, CycloneDX SBOMs, SLSA 1.1 terminology, and digest-based artifact identity. Reviewed: 2026-09-24.

Know what ships, where it came from, and what evidence is required before promotion. A passing scanner is one input to that decision.

Related: [Maven](maven.md), [GitHub Actions](github-actions-maven.md), [application security](application-security.md), [Docker](docker.md).

## Different evidence answers different questions

| Evidence | Answers | Does not prove |
|----------|---------|----------------|
| Resolved dependency inventory | Which components/versions entered the build? | Everything present in the final installer/image |
| SBOM | What components and relationships are declared for this artifact? | Absence of vulnerabilities or malicious behavior |
| Vulnerability findings | Which known advisories may apply? | Exploitability in this deployment |
| Signature | Does the artifact digest match a trusted signing identity? | That the signer or build was uncompromised |
| Provenance | How and where was this artifact built? | Compliance unless its claims are verified against policy |
| Reproducibility comparison | Can another build reproduce these bytes? | That the shared source is safe |

## Maven inventory

Run in the application project with its committed wrapper. These read the effective build/dependency configuration; Maven may still resolve plugins and dependencies from repositories. Treat an untrusted POM as executable build input.

```bash
./mvnw --batch-mode dependency:tree
./mvnw --batch-mode help:effective-pom
```

Pin plugin versions in the build; the short goals above resolve using that configuration. Inspect transitive dependencies, activated profiles, repositories, plugins, and BOM overrides. Record the JDK/runtime and native libraries too. A shaded JAR, container, or desktop installer can contain components absent from a simple dependency listing.

Bind an approved version of the CycloneDX Maven plugin to the release build and choose aggregate versus per-module output deliberately. Associate the SBOM with the **produced artifact digest**, retain it with the release, and validate required metadata/scopes. Do not hand-edit generated component versions to make a report pass. See [CycloneDX Maven plugin](https://github.com/CycloneDX/cyclonedx-maven-plugin).

## Triage findings

1. Identify the affected resolved component and packaged artifact; distinguish runtime exposure from build-tool exposure.
2. Check the advisory's version range, vulnerable feature, configuration, and reachable input path.
3. Upgrade or remove the dependency when feasible, then test affected behavior and rescan the actual deliverable.
4. If accepting or mitigating a finding, record evidence, owner, expiry, and the trigger for reassessment. A suppression without a review date becomes invisible debt.
5. Re-evaluate released artifacts when advisories change; yesterday's clean build does not answer today's question.

## Verify before promotion

Verification policy should bind artifact digest, expected signer identity/issuer, trusted builder, source repository/ref, and relevant build parameters. A cryptographically valid attestation from an unexpected identity is insufficient. Verify the downloaded bytes against that policy rather than trusting a tag, filename, or the presence of an SBOM.

Protect release credentials, pin CI actions, constrain repositories, and review dependency/plugin updates. Keep updates small enough to attribute failures. Preserve a documented emergency patch path and a way to locate every deployment of an affected digest.

## References

- [CycloneDX SBOM capabilities](https://cyclonedx.org/capabilities/sbom/)
- [SLSA artifact verification](https://slsa.dev/spec/v1.1/verifying-artifacts)
- [Sigstore signature verification](https://docs.sigstore.dev/cosign/verifying/verify/)
- [Maven dependency mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)

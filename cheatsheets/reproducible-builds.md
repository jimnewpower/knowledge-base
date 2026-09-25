# Reproducible Maven builds and releases cheat sheet

> Baseline: Maven 3.9.x, Java 21, project-pinned plugins and wrapper; repeatability must be measured for the actual artifact. Reviewed: 2026-09-25.

A source tag identifies code. A digest identifies output bytes. A reproducible build independently regenerates the same defined output from controlled inputs.

Related: [Git and tags](git.md), [Maven](maven.md), [software supply chain and SBOMs](software-supply-chain.md)[^sbom], [desktop packaging](java-desktop-packaging.md).

## Inputs to pin or record

| Input | Control |
|-------|---------|
| Source | Commit ID[^id], submodule state, generated-source inputs; clean release checkout |
| Build tools | Wrapper distribution/checksum, JDK[^jdk] vendor/version, plugin versions |
| Dependencies | Exact resolved artifacts, BOM[^bom]/parent versions, repositories; avoid moving snapshots |
| Environment | OS[^os]/architecture, locale, time zone, file encoding, external tools |
| Packaging | Archive ordering/timestamps, file modes, native libraries, container base digests |
| Configuration | Profiles, build properties, filtering inputs; runtime secrets stay out |

Dependency management controls library selection; plugin management controls build tools. Neither freezes an external service called by a build script.

## Archive timestamp

POM[^pom] properties fragment for reproducible-build-aware plugins. The timestamp is illustrative: use the project's documented stable release timestamp policy, not the current clock on every build.

Example abbreviations: UTF[^utf].

```xml
<properties>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <project.build.outputTimestamp>2026-09-25T00:00:00Z</project.build.outputTimestamp>
</properties>
```

This property is one input, not a reproducibility guarantee. Confirm every packaging plugin supports it and inspect generated manifests/resources for timestamps, absolute paths, random IDs and unstable ordering.

## Demonstrate reproducibility

1. Build the selected commit with `./mvnw --batch-mode --no-transfer-progress verify` in two independent clean workspaces.
2. Preserve the exact artifacts and compare SHA[^sha]-256 digests. Use `Get-FileHash` on Windows or `sha256sum` on Linux.
3. If bytes differ, unpack copies and inspect entry metadata/content to identify the uncontrolled input.
4. Repeat after fixing that input and retain toolchain/build metadata with the evidence.

Define whether comparison covers unsigned archives, container contents, or final installers. Signatures, notarization, and timestamp services can make final bytes vary; compare the intended reproducible boundary and separately verify signatures.

## Release evidence

Create an annotated or policy-required signed tag for the reviewed commit. Protect published tags and record the commit ID; Git does not make a tag intrinsically immutable. Retain artifact digest, test results, SBOM, dependency inventory, and provenance together.

Build once and promote those exact outputs. A cache is an optimization, not evidence that the inputs or result are trusted. Exercise an emergency patch/release path before needing it during an incident.

## References

- [Maven reproducible-build configuration](https://maven.apache.org/guides/mini/guide-reproducible-builds.html)
- [Reproducible Builds definition](https://reproducible-builds.org/docs/definition/)
- [Git tag behavior](https://git-scm.com/docs/git-tag)

[^sbom]: Software Bill of Materials.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^jdk]: Java Development Kit.
[^bom]: Bill of Materials — a dependency-version catalog in Maven.
[^os]: Operating System.
[^pom]: Project Object Model — Maven's project configuration.
[^sha]: Secure Hash Algorithm.
[^utf]: Unicode Transformation Format; UTF-8 encodes text using eight-bit code units.

# Software licensing and IP[^ip] compliance cheat sheet

> Baseline: engineering evidence for third-party software, source, data and assets; actual obligations depend on license terms, agreements and distribution context. Reviewed: 2026-09-25.

Maintain a traceable inventory of what ships and why the project has permission to use and distribute it. A vulnerability scan and a license review answer different questions.

Related: [software supply chain and SBOM generation](software-supply-chain.md)[^sbom], [reproducible builds](reproducible-builds.md), [application licensing telemetry](licensing-telemetry.md).

## Evidence per component

| Record | Why it matters |
|--------|----------------|
| Name, version, source and digest | Identify the exact imported or packaged material |
| Declared license and file-level notices | Root metadata can miss bundled or differently licensed files |
| SPDX[^spdx] expression, where established | Unambiguous machine-readable license identity/combination |
| Modifications and integration method | Review what was changed and how it is shipped/used |
| Distribution/deployment context | Internal use, customer installer, container, service or source delivery |
| Required notices/source/materials | Concrete deliverables tied to the approved interpretation |
| Decision, evidence, owner and date | Explain unresolved findings, exceptions and release approval |

Include fonts, icons, sample data, scientific models, native DLLs[^dll]/shared libraries, Java runtimes, copied snippets, and generated assets where applicable. A Maven dependency tree alone cannot find them all.

## License notation

SPDX expressions distinguish `MIT OR Apache-2.0`[^mit] (a choice), `MIT AND Apache-2.0` (both), and a license `WITH` a listed exception. Preserve upstream copyright notices. An identifier communicates terms; adding it does not create permission or prove compatibility.

Use `LicenseRef-...` only with a documented corresponding custom/extracted license, not as a way to hide an unresolved finding. Distinguish declared metadata, scanner detection, and the reviewed conclusion. Unknown provenance needs investigation before release.

## Release workflow

1. Generate the [SBOM](software-supply-chain.md) from the resolved build and inspect the actual final package for additional components.
2. Compare with the previous release: added versions, changed licenses, modifications, and new distribution paths.
3. Review actual license text/agreements for notice, source, redistribution and other applicable obligations; obtain the responsible legal/compliance decision when interpretation is unresolved.
4. Assemble approved notices, license texts, and required corresponding source/materials with a tested delivery location.
5. Associate the inventory, review evidence and delivered materials with the release digest.

Do not infer rights from a public download or a repository's visibility. A top-level license does not automatically cover every vendored file or dataset. Automated tools can identify candidates and missing metadata, but cannot establish the full contractual/distribution context.

## IP provenance controls

Record origin and modification history for imported code/data. Follow project contribution/ownership agreements and keep proprietary/customer material within its authorized scope. Review generated or copied material for provenance instead of assuming the generating tool supplied reuse rights.

## References

- [SPDX identifiers and expressions](https://spdx.dev/learn/handling-license-info/)
- [REUSE file-level licensing tutorial](https://reuse.software/tutorial/)
- [CycloneDX SBOM capabilities](https://cyclonedx.org/capabilities/sbom/)

[^ip]: Intellectual Property — rights associated with software, documentation, and other creative work.
[^sbom]: Software Bill of Materials.
[^spdx]: System Package Data Exchange, formerly Software Package Data Exchange — a standard for component and licensing metadata. See the [specification's naming history](https://spdx.github.io/spdx-spec/v3.0.1/front/introduction/).
[^dll]: Dynamic-Link Library.
[^mit]: Massachusetts Institute of Technology — the institution whose name identifies the MIT license.

# Java desktop packaging and distribution cheat sheet

> Baseline: JDK 21 `jlink`/`jpackage`, JavaFX 21 where applicable, and native builds for each supported OS/architecture. Reviewed: 2026-09-24.

Ship a tested application image with its runtime and native dependencies. The developer's installed JDK and working directory should not be hidden deployment requirements.

Related: [JavaFX](javafx.md), [Maven](maven.md), [SQLite](sqlite.md), [software supply chain](software-supply-chain.md), [modernization](java-jakarta-modernization.md).

## Pick the packaging stage

| Stage | Produces | Check |
|-------|----------|-------|
| Maven package | Application JARs/resources | Main class, dependency closure, reproducibility |
| `jdeps` analysis | Dependency/module information | Reflection, services, and native loading may need manual additions |
| `jlink` | Runtime image assembled from modules | Correct module graph, service providers, licensing files |
| `jpackage --type app-image` | Application launcher plus runtime/files | Launch and resources on a clean target machine |
| Native installer packaging | Platform installation artifact | Platform tools, signing, upgrade/uninstall behavior |

`jpackage` can generate the runtime or consume a prepared image. `jlink` does not turn arbitrary automatic-module JARs into a fully modular application; a classpath application can instead run on an appropriate linked JDK runtime.

## First prove an application image

PowerShell example for a non-modular application on Windows. Prerequisites: JDK 21 tools on `PATH`; `staging` contains `app.jar` and its runtime dependency JARs; the named main class exists. Use a clean output directory for each build.

```powershell
jpackage --type app-image `
  --name FieldDesk `
  --input staging `
  --main-jar app.jar `
  --main-class com.example.fielddesk.Main `
  --dest dist
```

This creates an application image, not an installer or an update service. Change names/paths to the real application. For JavaFX, include the correct platform-specific JavaFX libraries/native binaries and use a supported launcher arrangement; the classpath example alone does not resolve that setup.

Build native packages on their target platform: Windows, macOS, and Linux packages have different tool prerequisites and formats. An x64 build does not establish ARM compatibility. See [packaging overview](https://docs.oracle.com/en/java/javase/21/jpackage/packaging-overview.html).

## Desktop-specific failures

- Resolve bundled resources through classpath/module APIs. Store mutable configuration, databases, caches, and logs in appropriate user/application data directories, not beside a protected executable.
- FXML reflection may require `opens ... to javafx.fxml` in a modular application. Test the packaged runtime, not only Maven's development launcher.
- Verify native libraries for SQLite, GIS/image codecs, and other integrations on each target. A successful compile does not validate DLL/shared-library loading.
- Inspect service loading and dynamically selected providers when trimming runtime modules. Include a documented reason for every manually retained module.
- Preserve application identity across installer upgrades. Back up user data before irreversible schema migration; rolling back binaries alone may not roll back the database.

## Release checklist

Exercise first launch, paths with spaces/non-ASCII characters, a standard user account, offline startup, configuration persistence, upgrade, uninstall, and a corrupted/locked data file. Verify that uninstall preserves user data according to policy.

Sign/notarize artifacts using the target platform's distribution requirements and verify the final downloaded artifact. Bundle patched runtimes in subsequent releases: users updating their system JDK do not patch your embedded runtime. Publish checksums, SBOM/provenance, supported platforms, and recovery instructions with the release.

## References

- [jpackage command](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jpackage.html)
- [jlink command](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jlink.html)
- [OpenJFX runtime images](https://openjfx.io/openjfx-docs/#modular)

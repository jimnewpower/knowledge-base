# Structurizr DSL cheat sheet

> Baseline: Structurizr DSL; command examples target the 2026.09.19 Java distribution, requiring Java 21. Reviewed: 2026-09-24.

Structurizr defines **one architecture model and multiple views of it**. Reuse elements and relationships instead of maintaining unrelated drawings. C4 supplies the vocabulary; the DSL supplies an authoring format.

Related: [C4 diagrams](c4-diagrams.md), [architecture documentation](architecture-documentation.md), [ADRs](architecture-decisions.md).

## Complete starter workspace

Save this original example as `workspace.dsl`. It models the same illustrative desktop system as the C4 sheet. No external includes, themes, plugins, or credentials are needed.

```text
workspace "Field Analysis" "Desktop analysis architecture" {
    model {
        analyst = person "Analyst" "Prepares projects and reviews scores"
        catalog = softwareSystem "Dataset Catalog" "Publishes source dataset metadata"

        analysis = softwareSystem "Field Analysis" "Owns projects and derived analysis results" {
            desktop = container "Desktop application" "Imports data and computes scores" "Java / JavaFX"
            projectDb = container "Project database" "Stores project settings and metadata" "SQLite" {
                tags "Database"
            }
            rasters = container "Raster store" "Stores imported and derived rasters" "GeoTIFF files"
        }

        analyst -> desktop "Prepares projects and reviews scores using"
        desktop -> catalog "Discovers source datasets" "HTTPS / JSON"
        desktop -> projectDb "Reads and writes project metadata" "JDBC"
        desktop -> rasters "Reads and writes raster data" "Filesystem I/O"

        workstation = deploymentEnvironment "Workstation" {
            deploymentNode "Analyst workstation" "Single-user installation" "Windows / Linux" {
                containerInstance desktop
                containerInstance projectDb
                containerInstance rasters
            }
        }
    }

    views {
        systemContext analysis "AnalysisContext" {
            include *
            autoLayout lr
        }
        container analysis "AnalysisContainers" {
            include *
            autoLayout lr
        }
        dynamic analysis "ImportDataset" {
            analyst -> desktop "Starts an import"
            desktop -> catalog "Looks up source metadata"
            desktop -> rasters "Writes imported raster data"
            desktop -> projectDb "Records imported dataset metadata"
            autoLayout lr
        }
        deployment analysis workstation "WorkstationDeployment" {
            include *
            autoLayout lr
        }
        styles {
            element "Person" {
                shape Person
            }
            element "Database" {
                shape Cylinder
            }
        }
    }
}
```

This uses the basic structure described in the [DSL tutorial](https://docs.structurizr.com/dsl/tutorial). The DSL's default implied relationships allow detailed relationships to appear at higher levels, such as Analyst → Field Analysis. Review those summaries: several detailed relationships may collapse into a description that is too vague for the context view.

The deployment view deliberately covers only the workstation; it does not describe how the external catalog is hosted. The dynamic view shows an illustrative successful import, not crash recovery or atomicity across stores.

## Syntax to remember

| Construct | Purpose | Important detail |
|-----------|---------|------------------|
| `name = person "Name" "Description"` | Identifier plus display text | Use stable identifiers for references |
| `softwareSystem` → `container` → `component` | Model hierarchy | A component belongs inside one container |
| `source -> target "Intent" "Technology"` | Model relationship | Direction must agree with the verb |
| `systemContext systemId "ViewKey"` | Context view | Scope is a software system |
| `container systemId "ViewKey"` | Container view | Scope is a software system |
| `component containerId "ViewKey"` | Component view | Scope is a container |
| `dynamic scopeId "ViewKey"` | Ordered scenario | Interactions use relationships already in the model |
| `deployment systemId environmentId "ViewKey"` | Deployment view | Uses instances in the named environment |
| `include *` | Include the view's default selection | Meaning depends on view type; inspect the result |
| `autoLayout lr` | Automatic left-to-right layout | Does not encode business order |
| `tags "Database"` | Attach a tag | Styles select tags, not variable names |

See the [language reference](https://docs.structurizr.com/dsl/language), [dynamic view example](https://docs.structurizr.com/dsl/cookbook/dynamic-view/), and [deployment view example](https://docs.structurizr.com/dsl/cookbook/deployment-view/).

## Validate and export locally

Prerequisites: Java 21 and the pinned `structurizr-2026.09.19.war` from the official [binary downloads](https://docs.structurizr.com/binaries), placed beside `workspace.dsl`. Run from that directory:

```powershell
java -jar structurizr-2026.09.19.war validate -workspace workspace.dsl
java -jar structurizr-2026.09.19.war export -workspace workspace.dsl -format mermaid -output diagrams
```

The [validate command](https://docs.structurizr.com/validate) checks the workspace; it cannot verify whether the architecture is true. The [export command](https://docs.structurizr.com/export) writes diagram source for Mermaid. Rendering that source still requires a compatible Mermaid renderer. This repository's Markdown reader displays code fences as source, so use text sketches or checked-in image exports when a rendered diagram is needed here.

## Keep models maintainable

- Give views explicit stable keys so links and layout identity survive edits.
- Add relationships in `model`; specialize their descriptions for a scenario in `dynamic`.
- Keep a small model before adding components, tags, or filters. A valid graph can still be unreadable.
- Pin renderer/tool versions in CI. Inspect the rendered result after export because formats differ in supported shapes and features.
- Review model source and generated views together. Do not hand-edit generated Mermaid and expect the DSL to pick it up.
- Keep operational secrets out of model properties and URLs. Diagram labels need system roles, not credentials.

## References

- [Structurizr — DSL tutorial](https://docs.structurizr.com/dsl/tutorial)
- [Structurizr — DSL language reference](https://docs.structurizr.com/dsl/language)
- [Structurizr — dynamic views](https://docs.structurizr.com/dsl/cookbook/dynamic-view/)
- [Structurizr — deployment views](https://docs.structurizr.com/dsl/cookbook/deployment-view/)
- [Structurizr — binaries](https://docs.structurizr.com/binaries)
- [Structurizr — validate](https://docs.structurizr.com/validate)
- [Structurizr — export](https://docs.structurizr.com/export)

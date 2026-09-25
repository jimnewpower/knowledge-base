import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { categories } from "../data/categories";
import { searchAliases } from "../data/search-aliases";
import { collectNotes } from "./collect";
import { contentIssues, inspectMarkdown, validateExample } from "./content";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("published content", () => {
  it("has valid metadata, titles, links, examples, index entries, and category ownership", async () => {
    const { docs } = await collectNotes(root);
    const catalog = categories.flatMap((category) => category.sections.flatMap((section) => section.pages.map((page) => page.path)));
    expect(contentIssues(root, docs, catalog)).toEqual([]);
    for (const category of categories) {
      expect(category.startHere?.length, category.id).toBeGreaterThan(0);
      for (const entry of category.startHere ?? []) {
        expect(category.sections.some((section) => section.pages.some((page) => page.path === entry.path)), entry.path).toBe(true);
        expect(entry.reason.trim()).not.toBe("");
      }
    }
    for (const aliasPath of Object.keys(searchAliases)) expect(catalog, aliasPath).toContain(aliasPath);
  });

  it("reports missing targets, broken anchors, and uncategorized guides", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "kb-content-"));
    try {
      await fs.writeFile(path.join(temp, "target.md"), "# Target\n\n## Exists\n");
      await fs.mkdir(path.join(temp, "app"));
      await fs.writeFile(path.join(temp, "app", "README.md"), "# Reader\n");
      const docs = [{ id: "guides/broken.md", path: "guides/broken.md", title: "Broken", text: "# Broken\n\n[missing](../absent.md)\n[anchor](../target.md#absent)\n[excluded](../app/README.md)" }];
      const issues = contentIssues(temp, docs, []);
      expect(issues).toHaveLength(4);
      expect(issues.join("\n")).toContain("exactly one primary category");
      expect(issues.join("\n")).toContain("missing local target");
      expect(issues.join("\n")).toContain("missing heading");
      expect(issues.join("\n")).toContain("excluded from the reader");
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
  });

  it("uses Markdown semantics for references, fenced examples, and duplicate heading anchors", () => {
    const parsed = inspectMarkdown("# Page\n## Same\n## Same\n[link][ref]\n\n[ref]: other.md#same-1\n\n```md\n# Not a title\n[example](missing.md)\n```\n");
    expect(parsed.titles).toEqual(["Page"]);
    expect([...parsed.anchors]).toEqual(["page", "same", "same-1"]);
    expect(parsed.links.map((link) => link.url)).toEqual(["other.md#same-1"]);
  });

  it("rejects malformed complete examples and unsupported validation modes", () => {
    expect(validateExample("json", '{"key":}')).not.toBeNull();
    expect(validateExample("yaml", "key: 1\nkey: 2")).not.toBeNull();
    expect(validateExample("xml", "<root><child></root>")).not.toBeNull();
    expect(validateExample("bash", "exit 0")).toContain("unsupported");
    expect(validateExample("json", '{"key": 1}')).toBeNull();
    expect(validateExample("yaml", "key: [one, two]")).toBeNull();
    expect(validateExample("xml", '<root key="1"/>')).toBeNull();
  });

  it("flags missing metadata, invalid dates, duplicate titles, and missing references", () => {
    const docs = [
      { id: "cheatsheets/a.md", path: "cheatsheets/a.md", title: "Duplicate", text: "# Duplicate\n" },
      { id: "cheatsheets/b.md", path: "cheatsheets/b.md", title: "Duplicate", text: "# Duplicate\n\n> Baseline: example. Reviewed: 2026-02-30.\n" },
    ];
    const issues = contentIssues(root, docs, docs.map((doc) => doc.path)).join("\n");
    expect(issues).toContain("missing baseline or review date");
    expect(issues).toContain("invalid review date");
    expect(issues).toContain("duplicate title");
    expect(issues).toContain("missing primary reference");
  });
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { categories } from "../data/categories";
import { availablePages, categoryFor, contentType } from "./catalog";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("category catalog", () => {
  it("gives every cheat sheet exactly one primary home and only links to existing pages", () => {
    const pages = categories.flatMap((category) => category.sections.flatMap((section) => section.pages));
    const sheets = fs.readdirSync(path.join(repoRoot, "cheatsheets"))
      .filter((name) => name.endsWith(".md") && name !== "README.md")
      .map((name) => `cheatsheets/${name}`);
    const paths = pages.map((page) => page.path);
    expect(new Set(categories.map((category) => category.id)).size).toBe(categories.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.filter((file) => file.startsWith("cheatsheets/")).sort()).toEqual(sheets.sort());
    for (const page of pages) {
      expect(fs.existsSync(path.join(repoRoot, page.path)), page.path).toBe(true);
      expect(page.description.trim(), page.path).not.toBe("");
    }
  });

  it("limits secondary appearances to one and preserves primary ownership", () => {
    const secondary = categories.flatMap((category) => category.related);
    expect(new Set(secondary).size).toBe(secondary.length);
    for (const category of categories) {
      for (const related of category.related) {
        expect(categoryFor(related), related).toBeDefined();
        expect(categoryFor(related)?.id).not.toBe(category.id);
      }
    }
    expect(categoryFor("cheatsheets/spring-security.md")?.id).toBe("security-identity");
  });

  it("counts only primary pages present in the loaded corpus", () => {
    const docs = [{ id: "cheatsheets/c4-diagrams.md", path: "cheatsheets/c4-diagrams.md", title: "C4", text: "" }];
    expect(availablePages(categories[0], docs).map((page) => page.path)).toEqual(["cheatsheets/c4-diagrams.md"]);
    expect(availablePages(categories[0], [])).toEqual([]);
  });

  it("keeps content type independent of topic", () => {
    expect(contentType("cheatsheets/architecture-decisions.md")).toBe("cheatsheet");
    expect(contentType("decisions/0001-storage.md")).toBe("adr");
    expect(contentType("architecture/Storage.md")).toBe("architecture");
    expect(contentType("runbooks/restore.md")).toBe("runbook");
    expect(contentType("README.md")).toBe("note");
  });
});

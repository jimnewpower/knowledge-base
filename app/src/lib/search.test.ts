import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { collectNotes } from "../server/collect";
import { buildSearch, runSearch, suggestQueries } from "./search";
import { categoryFor } from "./catalog";
import type { IndexedDoc } from "../types";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
let corpus: IndexedDoc[];
let index: ReturnType<typeof buildSearch>;
beforeAll(async () => {
  corpus = (await collectNotes(repoRoot)).docs;
  index = buildSearch(corpus);
});

describe("runSearch", () => {
  it.each([
    ["a11y", "accessibility"],
    ["i18n", "localization"],
    ["l10n", "localization"],
    ["reactjs", "react"],
    ["orm", "jpa-and-hibernate"],
    ["hibernate", "jpa-and-hibernate"],
    ["log rotation", "log4j2"],
    ["accesibility", "accessibility"],
    ["autentication", "authentication"],
    ["rag", "rag"],
    ["mcp", "mcp"],
    ["prompt engineering", "prompt-engineering"],
    ["context engineering", "context-engineering"],
    ["skill authoring", "agent-skills-development"],
    ["coding assistant", "ai-assisted-development"],
    ["evals", "ai-evaluation"],
  ])("finds %s in the first three results", (query, slug) => {
    expect(runSearch(index, corpus, query).slice(0, 3).map((hit) => hit.path)).toContain(`cheatsheets/${slug}.md`);
  });

  it("discovers both identity and permission topics without treating them as equivalent", () => {
    const paths = runSearch(index, corpus, "auth", "security-identity").map((hit) => hit.path);
    expect(paths).toContain("cheatsheets/authentication.md");
    expect(paths).toContain("cheatsheets/authorization.md");
  });

  it("finds AI topics within their primary category", () => {
    const hits = runSearch(index, corpus, "retrieval", "ai");
    expect(hits.map((hit) => hit.path)).toContain("cheatsheets/rag.md");
    expect(hits.every((hit) => categoryFor(hit.path)?.id === "ai")).toBe(true);
    expect(runSearch(index, corpus, "rag", "languages-tools").map((hit) => hit.path)).not.toContain("cheatsheets/rag.md");
    expect(categoryFor("cheatsheets/ai-prompt-and-context-engineering.md")?.id).toBe("ai");
  });

  it("filters before limiting results and keeps short unknown tokens exact", () => {
    const hits = runSearch(index, corpus, "Java", "data-persistence");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((hit) => categoryFor(hit.path)?.id === "data-persistence")).toBe(true);
    expect(runSearch(index, corpus, "jpx")).toEqual([]);
    expect(runSearch(index, corpus, "   ")).toEqual([]);
    expect(runSearch(index, corpus, "a11y", "security-identity")).toEqual([]);
  });

  it("keeps AND semantics and offers broader typo suggestions that resolve", () => {
    expect(runSearch(index, corpus, "a11y nonexistentword")).toEqual([]);
    const suggestions = suggestQueries(index, "accesiblty", "application-development");
    expect(suggestions.length).toBeGreaterThan(0);
    for (const query of suggestions) expect(runSearch(index, corpus, query, "application-development").length).toBeGreaterThan(0);
  });
  it("ranks the concurrency note ahead of the cheat-sheet index", async () => {
    const { docs } = await collectNotes(repoRoot);
    const hits = runSearch(buildSearch(docs), docs, "virtual thread");
    expect(hits[0]?.path).toBe("cheatsheets/java-concurrency.md");
    expect(hits.map((hit) => hit.path)).toContain("cheatsheets/README.md");
  });

  it("finds a command in the git note", async () => {
    const { docs } = await collectNotes(repoRoot);
    const hits = runSearch(buildSearch(docs), docs, "rebase");
    expect(hits[0]?.path).toBe("cheatsheets/git.md");
  });
});

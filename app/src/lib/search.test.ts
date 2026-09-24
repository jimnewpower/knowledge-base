import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { collectNotes } from "../server/collect";
import { buildSearch, runSearch } from "./search";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("runSearch", () => {
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

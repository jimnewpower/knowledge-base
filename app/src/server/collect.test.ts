import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { collectNotes, safeResolve } from "./collect";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const temps: string[] = [];

afterEach(async () => {
  await Promise.all(temps.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("safeResolve", () => {
  it("stays inside the library", () => {
    const root = path.resolve(os.tmpdir(), "kb-root");
    const note = safeResolve(root, "cheatsheets/git.md");
    expect(note?.endsWith(`${path.sep}cheatsheets${path.sep}git.md`)).toBe(true);
    expect(safeResolve(root, "../outside.md")).toBeNull();
    expect(safeResolve(root, "app/README.md")).toBeNull();
    expect(safeResolve(root, ".git/config")).toBeNull();
    expect(safeResolve(root, "cheatsheets/%2e%2e/%2e%2e/outside.md")).toBeNull();
  });
});

describe("collectNotes", () => {
  it("indexes markdown notes and leaves the reader out", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-"));
    temps.push(root);
    await fs.mkdir(path.join(root, "app"), { recursive: true });
    await fs.mkdir(path.join(root, "cheatsheets"), { recursive: true });
    await fs.mkdir(path.join(root, "node_modules", "pkg"), { recursive: true });
    await fs.mkdir(path.join(root, "empty"), { recursive: true });
    await fs.writeFile(path.join(root, "README.md"), "# Hello\n");
    await fs.writeFile(path.join(root, "app", "secret.md"), "# Secret\n");
    await fs.writeFile(path.join(root, "node_modules", "pkg", "x.md"), "# Package\n");
    await fs.writeFile(path.join(root, "cheatsheets", "git.md"), "# Git cheat sheet\n\n## Branching\n");
    await fs.writeFile(path.join(root, "cheatsheets", "README.md"), "# Cheat sheets\n");

    const { tree, docs } = await collectNotes(root);
    expect(docs.map((doc) => doc.path).sort()).toEqual([
      "README.md",
      "cheatsheets/README.md",
      "cheatsheets/git.md",
    ]);
    expect(tree.map((node) => node.path)).toEqual(["README.md", "cheatsheets"]);
    expect(tree[1]?.children?.map((node) => node.path)).toEqual([
      "cheatsheets/README.md",
      "cheatsheets/git.md",
    ]);
    expect(docs.find((doc) => doc.path === "cheatsheets/git.md")?.title).toBe("Git cheat sheet");
  });

  it("reads this repository", async () => {
    const { docs, tree } = await collectNotes(repoRoot);
    expect(docs.some((doc) => doc.path === "README.md")).toBe(true);
    expect(docs.some((doc) => doc.path === "cheatsheets/git.md")).toBe(true);
    expect(docs.some((doc) => doc.path === "app" || doc.path.startsWith("app/"))).toBe(false);
    expect(tree.some((node) => node.type === "dir" && node.path === "cheatsheets")).toBe(true);
    expect(docs.find((doc) => doc.path === "cheatsheets/bash.md")?.title).toBe("Bash cheat sheet");
  });
});

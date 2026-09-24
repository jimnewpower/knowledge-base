import { describe, expect, it } from "vitest";
import { ancestors, parseHref, resolveKbPath } from "./paths";

describe("resolveKbPath", () => {
  it("resolves links relative to the open note", () => {
    expect(resolveKbPath("README.md", "cheatsheets/git.md")).toBe("cheatsheets/git.md");
    expect(resolveKbPath("cheatsheets/README.md", "git.md")).toBe("cheatsheets/git.md");
    expect(resolveKbPath("cheatsheets/git.md", "../README.md")).toBe("README.md");
  });

  it("rejects paths that leave the library", () => {
    expect(resolveKbPath("README.md", "../../outside.md")).toBeNull();
    expect(resolveKbPath("README.md", "")).toBeNull();
  });
});

describe("parseHref", () => {
  it("classifies notes, hashes, and web links", () => {
    expect(parseHref("cheatsheets/README.md", "git.md#branching")).toEqual({
      type: "note",
      path: "cheatsheets/git.md",
      id: "branching",
    });
    expect(parseHref("cheatsheets/git.md", "#daily-loop")).toEqual({
      type: "hash",
      id: "daily-loop",
    });
    expect(parseHref("README.md", "https://example.com/spec")).toEqual({
      type: "external",
      href: "https://example.com/spec",
    });
    expect(parseHref("README.md", "LICENSE")).toEqual({ type: "asset", path: "LICENSE" });
  });
});

describe("ancestors", () => {
  it("lists parent directories", () => {
    expect(ancestors("domains/digital-engineering/thread.md")).toEqual([
      "domains",
      "domains/digital-engineering",
    ]);
  });
});

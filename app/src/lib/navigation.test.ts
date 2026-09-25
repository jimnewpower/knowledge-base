import { describe, expect, it } from "vitest";
import { home, locationHref, readLocation } from "./navigation";

describe("navigation URLs", () => {
  it("preserves existing note, query, view, and fragment links", () => {
    const url = new URL("https://kb.test/?q=C4&doc=cheatsheets/c4-diagrams.md&view=enhanced#Choose%20the%20view");
    const location = readLocation(url);
    expect(location).toEqual({ ...home, q: "C4", doc: "cheatsheets/c4-diagrams.md", view: "enhanced", hash: "Choose the view" });
    expect(readLocation(new URL(locationHref(location), url))).toEqual(location);
  });

  it("round-trips category filters while keeping notes canonical", () => {
    const location = { ...home, category: "languages-tools", tag: "Java", type: "cheatsheet" as const };
    expect(readLocation(new URL(locationHref(location), "https://kb.test"))).toEqual(location);
    const note = new URL(locationHref({ ...location, doc: "cheatsheets/java.md" }), "https://kb.test");
    expect([...note.searchParams.keys()]).toEqual(["doc"]);
    expect(locationHref(home)).toBe("?");
  });

  it("handles unknown types and malformed fragments without breaking navigation", () => {
    const location = readLocation(new URL("https://kb.test/?doc=README.md&category=missing&type=__proto__#%E0%A4"));
    expect(location.category).toBeNull();
    expect(location.type).toBe("all");
    expect(location.hash).toBe("%E0%A4");
  });
});

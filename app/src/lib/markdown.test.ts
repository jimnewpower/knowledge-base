import { describe, expect, it } from "vitest";
import { allHeadings, titleOf } from "./markdown";

describe("titleOf", () => {
  it("keeps acronym footnotes out of navigation titles", () => {
    expect(titleOf("# HTTP[^http] and TLS[^tls] cheat sheet", "fallback")).toBe("HTTP and TLS cheat sheet");
  });

  it("uses the first heading outside a code fence", () => {
    const markdown = ["```bash", "# Always quote paths", "```", "", "# Bash cheat sheet", ""].join("\n");
    expect(titleOf(markdown, "bash")).toBe("Bash cheat sheet");
  });

  it("falls back when the note has no heading", () => {
    expect(titleOf("Just a paragraph.", "notes")).toBe("notes");
  });
});

describe("allHeadings", () => {
  it("skips shell comments and cleans inline markup", () => {
    const markdown = [
      "# Git cheat sheet",
      "",
      "```bash",
      "# Always quote paths",
      "```",
      "",
      "## `.gitignore`",
      "",
      "## When *not* to add a broker",
    ].join("\n");
    expect(allHeadings(markdown).map((heading) => heading.text)).toEqual([
      "Git cheat sheet",
      ".gitignore",
      "When not to add a broker",
    ]);
  });
});

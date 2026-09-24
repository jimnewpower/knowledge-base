import { describe, expect, it } from "vitest";
import { rehypeHeadingIds, rehypeQueryMarks } from "./rehype";

describe("rehype plugins", () => {
  it("marks the first match and slugs headings", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: "Daily loop" }],
        },
        { type: "text", value: "Run git rebase, then git status." },
      ],
    };
    rehypeHeadingIds()(tree);
    rehypeQueryMarks("rebase")()(tree);
    const heading = tree.children[0] as unknown as { properties: { id: string } };
    expect(heading.properties.id).toBe("daily-loop");
    const marked = tree.children.filter(
      (node) => node.type === "element" && "tagName" in node && node.tagName === "mark",
    );
    expect(marked).toHaveLength(1);
    expect(marked[0]).toMatchObject({
      properties: { id: "kb-first-hit" },
      children: [{ value: "rebase" }],
    });
  });
});

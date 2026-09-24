import GithubSlugger from "github-slugger";
import { matchRanges } from "./marks";
import { queryTerms } from "./paths";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
};

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: HastNode, visit: (node: HastNode) => void): void {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

/** Stable heading ids from the rendered heading text, including inline code and emphasis. */
export function rehypeHeadingIds() {
  const slugger = new GithubSlugger();
  return (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== "element" || !node.tagName || !/^h[1-6]$/.test(node.tagName)) return;
      const text = textOf(node).replace(/\s+/g, " ").trim();
      node.properties = { ...node.properties, id: slugger.slug(text) || "section" };
    });
  };
}

/** Mark query terms in the syntax tree so React owns the highlights. */
export function rehypeQueryMarks(query: string) {
  const terms = queryTerms(query).sort((a, b) => b.length - a.length);
  return () => {
    const state = { first: true };
    return (tree: HastNode) => {
      if (!terms.length || !tree.children) return;
      markChildren(tree, terms, state);
    };
  };
}

function markChildren(node: HastNode, terms: string[], state: { first: boolean }): void {
  if (!node.children || node.tagName === "mark") return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === "text" && child.value) {
      const parts = splitText(child.value, terms, state);
      if (!parts) continue;
      node.children.splice(i, 1, ...parts);
      i += parts.length - 1;
      continue;
    }
    markChildren(child, terms, state);
  }
}

function splitText(value: string, terms: string[], state: { first: boolean }): HastNode[] | null {
  const ranges = matchRanges(value, terms);
  if (!ranges.length) return null;
  const nodes: HastNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      nodes.push({ type: "text", value: value.slice(cursor, range.start) });
    }
    const properties: Record<string, unknown> = { className: ["kb-hit"] };
    if (state.first) {
      properties.id = "kb-first-hit";
      state.first = false;
    }
    nodes.push({
      type: "element",
      tagName: "mark",
      properties,
      children: [{ type: "text", value: value.slice(range.start, range.end) }],
    });
    cursor = range.end;
  }
  if (cursor < value.length) nodes.push({ type: "text", value: value.slice(cursor) });
  return nodes;
}

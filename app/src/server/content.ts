import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import GithubSlugger from "github-slugger";
import { parseDocument } from "yaml";
import { XMLValidator } from "fast-xml-parser";
import type { IndexedDoc } from "../types";
import { safeResolve } from "./collect";

type Node = {
  type: string; value?: string; url?: string; identifier?: string; alt?: string;
  depth?: number; lang?: string | null; meta?: string | null; children?: Node[];
  position?: { start: { line: number } };
};

export function markdownTree(text: string): Node {
  return unified().use(remarkParse).use(remarkGfm).parse(text) as Node;
}

export function nodesOf(tree: Node): Node[] {
  return [tree, ...(tree.children ?? []).flatMap(nodesOf)];
}

function plainText(node: Node): string {
  return node.value ?? node.alt ?? (node.children ?? []).map(plainText).join("");
}

export function inspectMarkdown(text: string) {
  const nodes = nodesOf(markdownTree(text));
  const slugger = new GithubSlugger();
  const headings = nodes.filter((node) => node.type === "heading");
  const definitions = new Map(nodes.filter((node) => node.type === "definition").map((node) => [node.identifier, node.url]));
  return {
    titles: headings.filter((node) => node.depth === 1).map(plainText),
    anchors: new Set(headings.map((node) => slugger.slug(plainText(node).replace(/\s+/g, " ").trim()) || "section")),
    links: nodes.filter((node) => ["link", "image", "linkReference", "imageReference"].includes(node.type))
      .map((node) => ({ url: node.url ?? definitions.get(node.identifier), line: node.position?.start.line ?? 1 })),
    examples: nodes.filter((node) => node.type === "code"),
  };
}

export function validateExample(language: string, source: string): string | null {
  try {
    if (language === "json") JSON.parse(source);
    else if (language === "yaml" || language === "yml") {
      const parsed = parseDocument(source, { uniqueKeys: true });
      if (parsed.errors.length) return parsed.errors.map((error) => error.message).join("; ");
    } else if (language === "xml") {
      const result = XMLValidator.validate(source);
      if (result !== true) return result.err.msg;
    } else return `unsupported validation language: ${language}`;
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function contentIssues(root: string, docs: IndexedDoc[], catalogPaths: string[]): string[] {
  const issues: string[] = [];
  const parsed = new Map(docs.map((doc) => [doc.path, inspectMarkdown(doc.text)]));
  const titles = new Map<string, string>();
  const referencePaths = docs.filter((doc) => doc.path.includes("/") && !doc.path.endsWith("/README.md")).map((doc) => doc.path);
  for (const reference of referencePaths) {
    if (catalogPaths.filter((entry) => entry === reference).length !== 1) issues.push(`${reference}: needs exactly one primary category`);
  }
  for (const entry of catalogPaths) {
    if (!parsed.has(entry)) issues.push(`${entry}: catalog path has no indexed document`);
  }
  for (const doc of docs) {
    const info = parsed.get(doc.path)!;
    const report = (message: string) => issues.push(`${doc.path}: ${message}`);
    if (info.titles.length !== 1) report("requires exactly one H1 title");
    const title = (info.titles[0] ?? "").trim().toLowerCase();
    if (titles.has(title)) report(`duplicate title with ${titles.get(title)}`);
    else titles.set(title, doc.path);
    if (doc.path.startsWith("cheatsheets/") && !doc.path.endsWith("/README.md")) {
      if (!/^> Baseline: .+ Reviewed: \d{4}-\d{2}-\d{2}\./m.test(doc.text)) report("missing baseline or review date");
      const date = /Reviewed: (\d{4}-\d{2}-\d{2})/.exec(doc.text)?.[1];
      if (date && (Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) report("invalid review date");
      if (!info.links.some((link) => link.url?.startsWith("https://"))) report("missing primary reference link");
      const index = parsed.get("cheatsheets/README.md");
      if (!index?.links.some((link) => link.url?.split("#")[0] === path.posix.basename(doc.path))) report("missing from cheat-sheet index");
    }
    for (const link of info.links) {
      if (!link.url) { report(`line ${link.line}: unresolved link reference`); continue; }
      if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(link.url)) continue;
      let destination: string;
      let anchor: string;
      try {
        const url = new URL(link.url, `https://kb.invalid/${doc.path}`);
        destination = decodeURIComponent(url.pathname.slice(1));
        anchor = decodeURIComponent(url.hash.slice(1));
      } catch { report(`line ${link.line}: malformed link ${link.url}`); continue; }
      const absolute = path.resolve(root, destination);
      if (!absolute.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(absolute)) {
        report(`line ${link.line}: missing local target ${link.url}`);
        continue;
      }
      if (!safeResolve(root, destination)) {
        report(`line ${link.line}: target excluded from the reader ${link.url}; use a public source link`);
        continue;
      }
      if (anchor && destination.endsWith(".md")) {
        const target = parsed.get(destination) ?? inspectMarkdown(fs.readFileSync(absolute, "utf8"));
        if (!target.anchors.has(anchor)) report(`line ${link.line}: missing heading ${link.url}`);
      }
    }
    for (const example of info.examples.filter((node) => node.meta?.split(/\s+/).includes("validate"))) {
      const error = validateExample(example.lang ?? "", example.value ?? "");
      if (error) report(`line ${example.position?.start.line}: invalid example: ${error}`);
    }
  }
  return issues;
}

import fs from "node:fs/promises";
import path from "node:path";
import { titleOf } from "../lib/markdown";
import type { IndexedDoc, TreeNode } from "../types";

/** `app` is this reader. The other names are dependency and build trees. */
const SKIP_DIRECTORIES = new Set(["app", "node_modules", "dist", "coverage"]);
const MAX_BYTES = 1_000_000;

export function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

export function safeResolve(root: string, rel: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rel);
  } catch {
    return null;
  }
  const cleaned = decoded.replace(/^[/\\]+/, "");
  if (!cleaned || cleaned.split(/[/\\]/).includes("..")) return null;
  const abs = path.resolve(root, cleaned);
  const rootAbs = path.resolve(root);
  if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) return null;
  const relPosix = toPosix(path.relative(rootAbs, abs));
  const parts = relPosix.split("/");
  if (parts.some((part) => part.startsWith(".") || SKIP_DIRECTORIES.has(part))) return null;
  return abs;
}

function fallbackTitle(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function compareNodes(a: TreeNode, b: TreeNode): number {
  const rank = (node: TreeNode) => {
    if (node.type === "file" && node.name.toLowerCase() === "readme.md") return 0;
    if (node.type === "dir") return 1;
    return 2;
  };
  const byRank = rank(a) - rank(b);
  if (byRank !== 0) return byRank;
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

async function walk(dir: string, rel: string, docs: IndexedDoc[]): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const children = await walk(full, childRel, docs);
      if (children.length === 0) continue;
      nodes.push({ name: entry.name, path: childRel, type: "dir", children });
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
    const stat = await fs.stat(full);
    if (stat.size > MAX_BYTES) continue;
    let text = await fs.readFile(full, "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const title = titleOf(text, fallbackTitle(entry.name));
    docs.push({ id: childRel, path: childRel, title, text });
    nodes.push({ name: entry.name, path: childRel, type: "file", title });
  }
  nodes.sort(compareNodes);
  return nodes;
}

export async function collectNotes(root: string): Promise<{ tree: TreeNode[]; docs: IndexedDoc[] }> {
  const docs: IndexedDoc[] = [];
  const tree = await walk(root, "", docs);
  return { tree, docs };
}

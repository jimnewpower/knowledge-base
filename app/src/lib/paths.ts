import type { TreeNode } from "../types";

export function ancestors(relPath: string): string[] {
  const parts = relPath.split("/");
  const dirs: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    dirs.push(parts.slice(0, i).join("/"));
  }
  return dirs;
}

export function defaultExpanded(tree: TreeNode[], selected: string | null): Set<string> {
  const next = new Set<string>();
  for (const node of tree) {
    if (node.type === "dir") next.add(node.path);
  }
  if (selected) {
    for (const dir of ancestors(selected)) next.add(dir);
  }
  return next;
}

export function fileUrl(relPath: string): string {
  return `/files/${relPath.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
}

export function resolveKbPath(fromFile: string, hrefPath: string): string | null {
  const trimmed = hrefPath.trim();
  if (!trimmed) return null;
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return null;
  }
  const dir = fromFile.split("/").slice(0, -1);
  const parts = [...dir, ...decoded.split(/[/\\]/)];
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return null;
      out.pop();
      continue;
    }
    out.push(part);
  }
  return out.join("/");
}

export type ParsedHref =
  | { type: "hash"; id: string }
  | { type: "note"; path: string; id?: string }
  | { type: "asset"; path: string }
  | { type: "external"; href: string };

export function parseHref(fromFile: string, href: string): ParsedHref {
  const trimmed = href.trim();
  if (!trimmed) return { type: "external", href };
  if (trimmed.startsWith("#")) {
    return { type: "hash", id: decodeHash(trimmed.slice(1)) };
  }
  if (trimmed.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return { type: "external", href: trimmed };
  }
  const hashAt = trimmed.indexOf("#");
  const before = hashAt >= 0 ? trimmed.slice(0, hashAt) : trimmed;
  const id = hashAt >= 0 ? decodeHash(trimmed.slice(hashAt + 1)) : undefined;
  const pathOnly = before.split("?")[0];
  if (!pathOnly) return id ? { type: "hash", id } : { type: "external", href: trimmed };
  const resolved = resolveKbPath(fromFile, pathOnly);
  if (!resolved) return { type: "external", href: trimmed };
  if (resolved.toLowerCase().endsWith(".md")) return { type: "note", path: resolved, id };
  return { type: "asset", path: resolved };
}

function decodeHash(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function queryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

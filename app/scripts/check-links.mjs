import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const parser = unified().use(remarkParse).use(remarkGfm);

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ["app", "node_modules", "dist", "coverage"].includes(entry.name) || entry.isSymbolicLink()) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(full));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function externalLinks(tree) {
  const links = [];
  function visit(node) {
    if (node.url && ["link", "image", "definition"].includes(node.type)) {
      try {
        const url = new URL(node.url);
        const host = url.hostname;
        const example = /(^|\.)(example\.(com|org|net)|localhost)$|\.(test|invalid|example|local)$/.test(host);
        const loopback = host === "[::1]" || host.startsWith("127.") || host === "0.0.0.0";
        if (["https:", "http:"].includes(url.protocol) && !example && !loopback) {
          url.hash = "";
          links.push(url.href);
        }
      } catch { /* Relative links are checked by the content gate. */ }
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(tree);
  return links;
}

// Optional repository-relative paths make a focused authoring check inexpensive.
const requested = process.argv.slice(2);
const files = requested.length ? requested.map((file) => {
  const full = path.resolve(root, file);
  if (!full.startsWith(root + path.sep) || !full.endsWith(".md")) throw new Error(`Expected a Markdown path inside the repository: ${file}`);
  return full;
}) : [...await markdownFiles(root), path.join(root, "app/README.md")];
const references = new Map();
for (const file of files) {
  for (const url of externalLinks(parser.parse(await fs.readFile(file, "utf8")))) {
    if (!references.has(url)) references.set(url, new Set());
    references.get(url).add(path.relative(root, file));
  }
}

async function inspect(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow", signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "knowledge-base-link-check/1.0", Range: "bytes=0-0" },
      });
      await response.body?.cancel();
      if (response.ok) return null;
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
      return `HTTP ${response.status}`;
    } catch (error) {
      if (attempt === 1) return `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ""}`;
    }
  }
}

const queue = [...references.keys()];
const failures = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    const error = await inspect(url);
    if (error) failures.push({ url, error, pages: [...references.get(url)] });
  }
}));
failures.sort((a, b) => a.url.localeCompare(b.url));
for (const failure of failures) console.error(`${failure.error}: ${failure.url}\n  ${failure.pages.join(", ")}`);
console.log(`Checked ${references.size} remote destinations from ${files.length} pages; ${failures.length} require review.`);
if (failures.length) process.exitCode = 1;

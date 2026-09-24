import fs from "node:fs";
import type { ServerResponse } from "node:http";
import path from "node:path";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { collectNotes, safeResolve, toPosix } from "./src/server/collect";

type Cache = {
  tree: Awaited<ReturnType<typeof collectNotes>>["tree"];
  docs: Awaited<ReturnType<typeof collectNotes>>["docs"];
  revision: number;
  dirty: boolean;
  building?: Promise<void>;
};

function mimeFor(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  const map: Record<string, string> = {
    md: "text/markdown; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    csv: "text/csv; charset=utf-8",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  if (map[ext]) return map[ext];
  return ext ? "application/octet-stream" : "text/plain; charset=utf-8";
}

function sendJson(res: ServerResponse, body: unknown): void {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function kbPlugin(kbRoot: string): Plugin {
  const cache: Cache = { tree: [], docs: [], revision: 0, dirty: true };

  async function ensure(): Promise<Cache> {
    if (!cache.dirty && cache.revision > 0) return cache;
    if (cache.building) {
      await cache.building;
      return cache;
    }
    cache.building = (async () => {
      cache.dirty = false;
      try {
        const corpus = await collectNotes(kbRoot);
        cache.tree = corpus.tree;
        cache.docs = corpus.docs;
        cache.revision += 1;
      } catch (err) {
        cache.dirty = true;
        throw err;
      }
    })();
    try {
      await cache.building;
    } finally {
      cache.building = undefined;
    }
    return cache;
  }

  const api: Connect.NextHandleFunction = async (req, res, next) => {
    try {
      const url = req.url ?? "";
      const pathname = url.split("?")[0];
      if (req.method === "GET" && pathname === "/api/tree") {
        const { tree } = await ensure();
        sendJson(res, tree);
        return;
      }
      if (req.method === "GET" && pathname === "/api/index") {
        const { docs, revision } = await ensure();
        sendJson(res, { revision, docs });
        return;
      }
      if (req.method === "GET" && pathname === "/api/revision") {
        const { revision } = await ensure();
        sendJson(res, { revision });
        return;
      }
      if (req.method === "GET" && pathname.startsWith("/files/")) {
        const rel = pathname.slice("/files/".length);
        const abs = safeResolve(kbRoot, rel);
        if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        const filename = path.basename(abs);
        res.setHeader("Content-Type", mimeFor(filename));
        res.setHeader("Content-Disposition", `inline; filename="${filename.replace(/"/g, "")}"`);
        res.setHeader("Cache-Control", "no-store");
        fs.createReadStream(abs).pipe(res);
        return;
      }
      next();
    } catch (err) {
      next(err as Error);
    }
  };

  function watch(server: ViteDevServer): void {
    server.watcher.add(kbRoot);
    const markDirty = (file: string) => {
      const rel = toPosix(path.relative(kbRoot, file));
      if (!rel || rel.startsWith("..") || !rel.toLowerCase().endsWith(".md")) return;
      const parts = rel.split("/");
      if (parts[0] === "app" || parts.includes("node_modules") || parts.includes("dist")) return;
      cache.dirty = true;
    };
    server.watcher.on("add", markDirty);
    server.watcher.on("change", markDirty);
    server.watcher.on("unlink", markDirty);
  }

  return {
    name: "knowledge-base",
    configureServer(server) {
      watch(server);
      server.middlewares.use(api);
    },
    configurePreviewServer(server) {
      server.middlewares.use(api);
    },
  };
}

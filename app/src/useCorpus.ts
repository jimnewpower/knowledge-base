import { useCallback, useEffect, useState } from "react";
import { buildSearch } from "./lib/search";
import type { IndexedDoc, TreeNode } from "./types";

type SearchIndex = ReturnType<typeof buildSearch>;

export function useCorpus() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [docs, setDocs] = useState<IndexedDoc[]>([]);
  const [mini, setMini] = useState<SearchIndex | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [treeRes, indexRes] = await Promise.all([
        fetch("/api/tree", { signal, cache: "no-store" }),
        fetch("/api/index", { signal, cache: "no-store" }),
      ]);
      if (!treeRes.ok || !indexRes.ok) {
        throw new Error(`Index request failed (${treeRes.status || indexRes.status}).`);
      }
      const treeJson = (await treeRes.json()) as TreeNode[];
      const indexJson = (await indexRes.json()) as { revision: number; docs: IndexedDoc[] };
      if (signal?.aborted) return;
      setTree(treeJson);
      setDocs(indexJson.docs);
      setMini(buildSearch(indexJson.docs));
      setRevision(indexJson.revision);
      setError(null);
    } catch (err) {
      if (signal?.aborted) return;
      if (!quiet) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!signal?.aborted && !quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  useEffect(() => {
    let cancel = false;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      void (async () => {
        try {
          const res = await fetch("/api/revision", { cache: "no-store" });
          if (!res.ok || cancel) return;
          const body = (await res.json()) as { revision: number };
          if (!cancel && body.revision !== revision) await load(undefined, true);
        } catch {
          /* The next tick retries. */
        }
      })();
    }, 3000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, [load, revision]);

  return { tree, docs, mini, revision, loading, error, reload: () => load() };
}

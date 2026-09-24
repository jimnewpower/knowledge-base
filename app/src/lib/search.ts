import MiniSearch from "minisearch";
import type { IndexedDoc, SearchHit } from "../types";
import { allHeadings } from "./markdown";
import { snippetAround } from "./marks";

type SearchDoc = IndexedDoc & { headings: string };

const RESULT_LIMIT = 40;

export function buildSearch(docs: IndexedDoc[]): MiniSearch<SearchDoc> {
  const mini = new MiniSearch<SearchDoc>({
    fields: ["title", "headings", "path", "text"],
    storeFields: ["title", "path"],
    searchOptions: {
      boost: { title: 6, headings: 3, path: 2, text: 1 },
      prefix: true,
      combineWith: "AND",
    },
  });
  mini.addAll(
    docs.map((doc) => ({
      ...doc,
      headings: allHeadings(doc.text)
        .filter((heading) => heading.depth >= 2)
        .map((heading) => heading.text)
        .join("\n"),
    })),
  );
  return mini;
}

/**
 * Index pages name every topic once. Rank the note that discusses the words ahead of them.
 */
function adjustedScore(path: string, score: number): number {
  if (path === "README.md" || path.endsWith("/README.md")) return score * 0.45;
  return score;
}

export function runSearch(mini: MiniSearch<SearchDoc>, docs: IndexedDoc[], query: string): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const fuzzy = q.length >= 7 ? 0.15 : false;
  const raw = mini.search(q, { fuzzy, prefix: true, combineWith: "AND" });
  return raw
    .map((hit) => {
      const path = String(hit.path);
      const doc = byPath.get(path);
      return {
        path,
        title: doc?.title ?? String(hit.title ?? path),
        score: adjustedScore(path, hit.score),
        snippet: snippetAround(doc?.text ?? "", q),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULT_LIMIT);
}

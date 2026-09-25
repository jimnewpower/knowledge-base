import MiniSearch from "minisearch";
import type { IndexedDoc, SearchHit } from "../types";
import { allHeadings } from "./markdown";
import { snippetAround } from "./marks";
import { categoryFor, pageFor } from "./catalog";
import { searchAliases } from "../data/search-aliases";

type SearchDoc = IndexedDoc & { headings: string; aliases: string; summary: string };

const RESULT_LIMIT = 40;

export function buildSearch(docs: IndexedDoc[]): MiniSearch<SearchDoc> {
  const mini = new MiniSearch<SearchDoc>({
    fields: ["title", "headings", "path", "text", "aliases", "summary"],
    storeFields: ["title", "path"],
    searchOptions: {
      boost: { title: 6, headings: 3, path: 2, text: 1, aliases: 5, summary: 2 },
      prefix: true,
      combineWith: "AND",
    },
  });
  mini.addAll(
    docs.map((doc) => ({
      ...doc,
      aliases: (searchAliases[doc.path] ?? []).join(" "),
      summary: pageFor(doc.path)?.description ?? "",
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

export function runSearch(mini: MiniSearch<SearchDoc>, docs: IndexedDoc[], query: string, category = ""): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const raw = mini.search(q, {
    fuzzy: (term) => term.length >= 5 ? 0.2 : false,
    prefix: true,
    combineWith: "AND",
    filter: (hit) => !category || categoryFor(String(hit.path))?.id === category,
  });
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

export function suggestQueries(mini: MiniSearch<SearchDoc>, query: string, category = ""): string[] {
  if (!query.trim()) return [];
  return mini.autoSuggest(query, {
    fuzzy: (term) => term.length >= 5 ? 0.3 : false,
    combineWith: "AND",
    filter: (hit) => !category || categoryFor(String(hit.path))?.id === category,
  }).map((item) => item.suggestion)
    .filter((value) => value.toLowerCase() !== query.trim().toLowerCase())
    .slice(0, 3);
}

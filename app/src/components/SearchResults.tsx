import { useEffect } from "react";
import type { ReactNode } from "react";
import { escapeRegExp } from "../lib/marks";
import { queryTerms } from "../lib/paths";
import type { SearchHit } from "../types";

type Props = {
  hits: SearchHit[];
  query: string;
  active: number;
  selected: string | null;
  onOpen: (path: string) => void;
};

export default function SearchResults({ hits, query, active, selected, onOpen }: Props) {
  useEffect(() => {
    document.getElementById(`hit-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, hits]);

  if (!hits.length) {
    return <p className="sidebar-empty">No notes match "{query.trim()}".</p>;
  }

  return (
    <ul className="results" id="search-results" role="listbox" aria-label="Search results">
      {hits.map((hit, index) => (
        <li key={hit.path} role="none">
          <button
            type="button"
            id={`hit-${index}`}
            role="option"
            data-hit-index={index}
            className="result"
            aria-selected={index === active}
            aria-current={hit.path === selected ? "page" : undefined}
            onClick={() => onOpen(hit.path)}
          >
            <span className="result-title">{hit.title}</span>
            <span className="result-path">{hit.path}</span>
            {hit.snippet && (
              <span className="result-snippet">
                <Marked text={hit.snippet} query={query} />
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Marked({ text, query }: { text: string; query: string }) {
  const terms = queryTerms(query).sort((a, b) => b.length - a.length);
  if (!terms.length) return text;
  const pattern = new RegExp(terms.map(escapeRegExp).join("|"), "gi");
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(<mark key={at}>{match[0]}</mark>);
    last = at + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

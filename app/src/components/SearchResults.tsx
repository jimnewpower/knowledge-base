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
  suggestions: string[];
  onQuery: (query: string) => void;
  filtered: boolean;
  onClearFilter: () => void;
  onBrowse: () => void;
};

export default function SearchResults({ hits, query, active, selected, onOpen, suggestions, onQuery, filtered, onClearFilter, onBrowse }: Props) {
  useEffect(() => {
    document.getElementById(`hit-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, hits]);

  if (!hits.length) {
    return <div className="sidebar-empty search-help">
      <p role="status">No notes match "{query.trim()}"{filtered ? " in this category" : ""}.</p>
      {suggestions.length > 0 && <><p>Try a related search:</p><ul>{suggestions.map((suggestion) =>
        <li key={suggestion}><button type="button" onClick={() => onQuery(suggestion)}>{suggestion}</button></li>
      )}</ul></>}
      <p>Try fewer words, a full term, or an acronym such as “JPA” or “a11y”.</p>
      {filtered && <button type="button" onClick={onClearFilter}>Search all categories</button>}
      <button type="button" onClick={onBrowse}>Browse topics</button>
    </div>;
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

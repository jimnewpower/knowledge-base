import type { KeyboardEvent, RefObject } from "react";
import type { SearchHit, TreeNode } from "../types";
import FileTree from "./FileTree";
import SearchResults from "./SearchResults";

type Props = {
  query: string;
  onQuery: (value: string) => void;
  onSubmit: () => void;
  onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  hits: SearchHit[];
  activeHit: number;
  showResults: boolean;
  onShowLibrary: () => void;
  onShowResults: () => void;
  tree: TreeNode[];
  selected: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  loading: boolean;
  error: string | null;
  docCount: number;
  onRetry: () => void;
};

export default function Sidebar({
  query,
  onQuery,
  onSubmit,
  onSearchKeyDown,
  inputRef,
  hits,
  activeHit,
  showResults,
  onShowLibrary,
  onShowResults,
  tree,
  selected,
  expanded,
  onToggle,
  onOpen,
  loading,
  error,
  docCount,
  onRetry,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="brand">
          <svg viewBox="0 0 32 32" className="brand-mark" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#3a2a22" />
            <path d="M8 9h16v2.2H8zm0 5.8h16v2.2H8zm0 5.8h10v2.2H8z" fill="#f6f3ed" />
          </svg>
          <div>
            <div className="brand-kicker">Software engineering</div>
            <div className="brand-title">Knowledge base</div>
          </div>
        </div>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="search">
            <span className="visually-hidden">Search notes</span>
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Search notes"
              value={query}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded={showResults}
              aria-activedescendant={showResults && hits.length ? `hit-${activeHit}` : undefined}
              onChange={(event) => onQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
            />
          </label>
        </form>
        {query.trim() && (
          <div className="pane-switch">
            <button type="button" aria-pressed={!showResults} onClick={onShowLibrary}>
              Library
            </button>
            <button type="button" aria-pressed={showResults} onClick={onShowResults}>
              Results{loading ? "" : ` (${hits.length})`}
            </button>
          </div>
        )}
      </div>
      <div className="sidebar-scroll">
        {error && (
          <div className="sidebar-empty" role="alert">
            <p>Could not load notes. {error}</p>
            <button type="button" className="retry" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
        {!error && loading && <p className="sidebar-empty">Indexing notes…</p>}
        {!error && !loading && showResults && (
          <SearchResults
            hits={hits}
            query={query}
            active={activeHit}
            selected={selected}
            onOpen={onOpen}
          />
        )}
        {!error && !loading && !showResults && (
          <nav aria-label="Notes">
            {tree.length === 0 ? (
              <p className="sidebar-empty">No markdown notes found.</p>
            ) : (
              <FileTree
                nodes={tree}
                selected={selected}
                expanded={expanded}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            )}
          </nav>
        )}
      </div>
      <div className="sidebar-foot">
        <span>{loading ? "…" : `${docCount} notes`}</span>
        <span>
          <kbd>/</kbd> to search
        </span>
      </div>
    </aside>
  );
}

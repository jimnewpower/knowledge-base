import { useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { IndexedDoc, SearchHit, TreeNode } from "../types";
import { categories } from "../data/categories";
import { availablePages, categoryFor } from "../lib/catalog";
import { home } from "../lib/navigation";
import type { LocationState, Navigate } from "../lib/navigation";
import CategoryIcon from "./CategoryIcon";
import NavigationLink from "./NavigationLink";
import FileTree from "./FileTree";
import SearchResults from "./SearchResults";

type Props = {
  location: LocationState;
  navigate: Navigate;
  docs: IndexedDoc[];
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
  location,
  navigate,
  docs,
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
  const [mobileBrowse, setMobileBrowse] = useState(false);
  const openLocation: Navigate = (next) => {
    navigate(next);
    setMobileBrowse(false);
  };
  return (
    <aside className={`sidebar${mobileBrowse || showResults ? " mobile-open" : ""}`}>
      <div className="sidebar-head">
        <NavigationLink className="brand" to={home} navigate={openLocation} aria-label="Knowledge base home">
          <svg viewBox="0 0 32 32" className="brand-mark" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#3a2a22" />
            <path d="M8 9h16v2.2H8zm0 5.8h16v2.2H8zm0 5.8h10v2.2H8z" fill="#f6f3ed" />
          </svg>
          <div>
            <div className="brand-kicker">Software engineering</div>
            <div className="brand-title">Knowledge base</div>
          </div>
        </NavigationLink>
        <button className="mobile-browse-toggle" type="button" aria-expanded={mobileBrowse || showResults} aria-controls="sidebar-content" onClick={() => {
          onShowLibrary();
          setMobileBrowse(showResults ? true : !mobileBrowse);
        }}>Browse</button>
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
      <div className="sidebar-scroll" id="sidebar-content">
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
          <div>
            <nav className="category-nav" aria-label="Categories">
              <NavigationLink to={home} navigate={openLocation} aria-current={!location.doc && !location.category ? "page" : undefined}>Home</NavigationLink>
              <p className="sidebar-label">Explore topics</p>
              {categories.map((category) => <NavigationLink key={category.id} to={{ ...home, category: category.id }} navigate={openLocation}
                aria-current={location.category === category.id ? "page" : categoryFor(selected)?.id === category.id ? "true" : undefined}>
                <CategoryIcon id={category.id} /><span>{category.title}</span><small>{availablePages(category, docs).length}</small>
              </NavigationLink>)}
            </nav>
            <details className="all-files">
              <summary>All files</summary>
              <nav aria-label="All files">
                {tree.length === 0 ? (
                  <p className="sidebar-empty">No markdown notes found.</p>
                ) : (
                  <FileTree
                    nodes={tree}
                    selected={selected}
                    expanded={expanded}
                    onToggle={onToggle}
                    onOpen={(path) => {
                      onOpen(path);
                      setMobileBrowse(false);
                    }}
                  />
                )}
              </nav>
            </details>
          </div>
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

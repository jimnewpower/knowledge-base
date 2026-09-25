import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";
import { ancestors, defaultExpanded } from "./lib/paths";
import { runSearch } from "./lib/search";
import { categories } from "./data/categories";
import { categoryFor, pageTitle } from "./lib/catalog";
import { home, useNavigation } from "./lib/navigation";
import BrowsePage from "./components/Browse";
import Breadcrumbs from "./components/Breadcrumbs";
import { useCorpus } from "./useCorpus";

export default function App() {
  const { location, navigate } = useNavigation();
  const { q: query, doc: selected, hash, view } = location;
  const category = categories.find((item) => item.id === location.category);
  const initialQuery = useRef(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tree, docs, mini, revision, loading, error, reload } = useCorpus();
  const [browseLocked, setBrowseLocked] = useState(false);
  const [userExpanded, setUserExpanded] = useState<Set<string> | null>(null);
  const [activeHit, setActiveHit] = useState(0);

  const hits = useMemo(
    () => (mini && query.trim() ? runSearch(mini, docs, query) : []),
    [mini, docs, query],
  );
  const showResults = Boolean(query.trim()) && !browseLocked;
  const expanded = userExpanded ?? defaultExpanded(tree, selected);
  const selectedDoc = docs.find((doc) => doc.path === selected);
  const selectedTitle = selectedDoc ? pageTitle(selectedDoc) : selected ?? "";
  const previousPage = useRef(`${selected}|${location.category}`);

  useEffect(() => {
    const doc = docs.find((item) => item.path === selected);
    const title = doc ? pageTitle(doc) : category?.title;
    document.title = title ? `${title} · Knowledge base` : "Knowledge base";
  }, [docs, selected, category]);

  useEffect(() => {
    setBrowseLocked(false);
  }, [selected, location.category]);

  useEffect(() => {
    const main = document.getElementById("main-content");
    main?.scrollTo({ top: 0 });
    const page = `${selected}|${location.category}`;
    if (previousPage.current !== page) main?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [selected, location.category]);

  useEffect(() => {
    setActiveHit(0);
  }, [query]);

  useEffect(() => {
    if (initialQuery.current) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (showResults || !selected) return;
    const el = document.querySelector(`[data-path="${CSS.escape(selected)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected, showResults, tree]);

  const openPath = useCallback(
    (path: string, hashId?: string) => {
      navigate({ ...home, q: query, doc: path, hash: hashId ?? "", view });
      setUserExpanded((prev) => {
        const next = new Set(prev ?? defaultExpanded(tree, path));
        for (const dir of ancestors(path)) next.add(dir);
        return next;
      });
    },
    [tree, query, view, navigate],
  );

  const onToggle = useCallback(
    (path: string) => {
      setUserExpanded((prev) => {
        const next = new Set(prev ?? defaultExpanded(tree, selected));
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    },
    [tree, selected],
  );

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) {
        navigate({ ...location, q: "" }, true);
        setBrowseLocked(false);
      } else {
        event.currentTarget.blur();
      }
      return;
    }
    if (!query.trim() || !hits.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setBrowseLocked(false);
      setActiveHit((index) => Math.min(hits.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setBrowseLocked(false);
      setActiveHit((index) => Math.max(0, index - 1));
    }
  }

  function openActiveHit() {
    const hit = hits[activeHit] ?? hits[0];
    if (!hit) return;
    setBrowseLocked(false);
    openPath(hit.path);
  }

  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar
        location={location}
        navigate={navigate}
        docs={docs}
        query={query}
        onQuery={(value) => {
          navigate({ ...location, q: value }, true);
          setBrowseLocked(false);
        }}
        onSubmit={openActiveHit}
        onSearchKeyDown={onSearchKeyDown}
        inputRef={inputRef}
        hits={hits}
        activeHit={Math.min(activeHit, Math.max(0, hits.length - 1))}
        showResults={showResults}
        onShowLibrary={() => setBrowseLocked(true)}
        onShowResults={() => setBrowseLocked(false)}
        tree={tree}
        selected={selected}
        expanded={expanded}
        onToggle={onToggle}
        onOpen={(path) => openPath(path)}
        loading={loading}
        error={error}
        docCount={docs.length}
        onRetry={() => void reload()}
      />
      {selected ? <Viewer
        path={selected}
        query={query}
        hash={hash}
        revision={revision}
        view={view}
        onView={(nextView) => navigate({ ...location, view: nextView }, true)}
        onNavigate={openPath}
        breadcrumbs={<Breadcrumbs category={categoryFor(selected)} title={selectedTitle} navigate={navigate} />}
      /> : <BrowsePage docs={docs} location={location} navigate={navigate} loading={loading} error={error} onRetry={() => void reload()} />}

    </div>
  );
}

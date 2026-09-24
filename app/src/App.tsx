import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";
import { ancestors, defaultExpanded } from "./lib/paths";
import { runSearch } from "./lib/search";
import { useCorpus } from "./useCorpus";

function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.replace(/^#/, "");
  let hash = rawHash;
  try {
    hash = decodeURIComponent(rawHash);
  } catch {
    hash = rawHash;
  }
  return { q: params.get("q") ?? "", doc: params.get("doc"), hash };
}

export default function App() {
  const initial = useRef(readUrl());
  const inputRef = useRef<HTMLInputElement>(null);
  const { tree, docs, mini, revision, loading, error, reload } = useCorpus();
  const [query, setQuery] = useState(initial.current.q);
  const [selected, setSelected] = useState<string | null>(initial.current.doc);
  const [hash, setHash] = useState(initial.current.hash);
  const [browseLocked, setBrowseLocked] = useState(false);
  const [userExpanded, setUserExpanded] = useState<Set<string> | null>(null);
  const [activeHit, setActiveHit] = useState(0);

  const hits = useMemo(
    () => (mini && query.trim() ? runSearch(mini, docs, query) : []),
    [mini, docs, query],
  );
  const showResults = Boolean(query.trim()) && !browseLocked;
  const expanded = userExpanded ?? defaultExpanded(tree, selected);

  useEffect(() => {
    if (selected || loading || docs.length === 0) return;
    if (docs.some((doc) => doc.path === "README.md")) setSelected("README.md");
    else setSelected(docs[0].path);
  }, [selected, loading, docs]);

  useEffect(() => {
    const doc = docs.find((item) => item.path === selected);
    document.title = doc ? `${doc.title} · Knowledge base` : "Knowledge base";
  }, [docs, selected]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selected) params.set("doc", selected);
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current !== next) history.replaceState(null, "", next);
  }, [query, selected, hash]);

  useEffect(() => {
    setActiveHit(0);
  }, [query]);

  useEffect(() => {
    if (initial.current.q) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
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
      setSelected(path);
      setHash(hashId ?? "");
      setUserExpanded((prev) => {
        const next = new Set(prev ?? defaultExpanded(tree, path));
        for (const dir of ancestors(path)) next.add(dir);
        return next;
      });
    },
    [tree],
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
        setQuery("");
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
      <Sidebar
        query={query}
        onQuery={(value) => {
          setQuery(value);
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
      <Viewer
        path={selected}
        query={query}
        hash={hash}
        revision={revision}
        onNavigate={openPath}
      />
    </div>
  );
}

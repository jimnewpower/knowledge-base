import { Component, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { fileUrl, parseHref } from "../lib/paths";
import { rehypeHeadingIds, rehypeQueryMarks } from "../lib/rehype";
import type { OutlineItem } from "../types";
import Outline from "./Outline";

type Props = {
  path: string | null;
  query: string;
  hash: string;
  revision: number;
  onNavigate: (path: string, hashId?: string) => void;
};

type Loaded = { path: string; text: string };
type LoadError = { path: string; message: string };

function sameOutline(a: OutlineItem[], b: OutlineItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.id === b[index].id && item.text === b[index].text && item.depth === b[index].depth,
  );
}

export default function Viewer({ path, query, hash, revision, onNavigate }: Props) {
  const scrollerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrollKey = useRef("");
  const copiedTimer = useRef(0);
  const [doc, setDoc] = useState<Loaded | null>(null);
  const [failure, setFailure] = useState<LoadError | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);

  if (doc && doc.path !== path) setDoc(null);
  if (failure && failure.path !== path) setFailure(null);

  const md = doc && doc.path === path ? doc.text : null;
  const error = failure && failure.path === path ? failure.message : null;
  const pageOutline = md ? outline : [];

  useEffect(() => {
    return () => window.clearTimeout(copiedTimer.current);
  }, []);

  useEffect(() => {
    if (!path) return;
    const ac = new AbortController();
    const requested = path;
    (async () => {
      try {
        const res = await fetch(fileUrl(requested), { signal: ac.signal, cache: "no-store" });
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "This note is not in the library."
              : `Could not open this note (${res.status}).`,
          );
        }
        const text = await res.text();
        if (ac.signal.aborted) return;
        setDoc({ path: requested, text });
        setFailure(null);
      } catch (err) {
        if (ac.signal.aborted) return;
        setDoc(null);
        setFailure({
          path: requested,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => ac.abort();
  }, [path, revision]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const scroller = scrollerRef.current;
    if (!body || md == null || !path) {
      if (md == null) scrollerRef.current?.scrollTo({ top: 0 });
      return;
    }

    const items: OutlineItem[] = [];
    for (const el of body.querySelectorAll("h2, h3")) {
      if (!(el instanceof HTMLElement) || !el.id) continue;
      items.push({
        depth: Number(el.tagName.slice(1)),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
        id: el.id,
      });
    }
    setOutline((prev) => (sameOutline(prev, items) ? prev : items));
    setActiveId((current) => (items.some((item) => item.id === current) ? current : (items[0]?.id ?? "")));

    const key = `${path}|${hash}|${query}|${md.length}`;
    if (scrollKey.current === key) return;
    scrollKey.current = key;

    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }
    const first = body.querySelector<HTMLElement>("#kb-first-hit");
    if (first) {
      first.scrollIntoView({ block: "center" });
      return;
    }
    scroller?.scrollTo({ top: 0 });
  }, [md, path, hash, query]);

  useEffect(() => {
    const root = scrollerRef.current;
    const body = bodyRef.current;
    if (!root || !body || outline.length === 0) return;
    const heads = [...body.querySelectorAll("h2, h3")];
    if (!heads.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0]?.target.id;
        if (id) setActiveId(id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: [0, 1] },
    );
    for (const head of heads) observer.observe(head);
    return () => observer.disconnect();
  }, [outline, md]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={pageOutline.length ? "reading" : "reading solo"}>
      <article className="viewer" ref={scrollerRef}>
        <div className="viewer-toolbar">
          <div className="viewer-path" title={path ?? ""}>
            {path ?? "Knowledge base"}
          </div>
          {path && (
            <div className="toolbar-actions">
              <button type="button" onClick={() => void copyLink()}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <button type="button" onClick={() => window.open(fileUrl(path), "_blank", "noopener,noreferrer")}>
                Source
              </button>
            </div>
          )}
        </div>
        {!path && <p className="status">Choose a note from the library, or search and open a result.</p>}
        {path && error && <p className="status error">{error}</p>}
        {path && !error && md == null && <p className="status">Loading…</p>}
        {path && md != null && (
          <div className="prose" ref={bodyRef}>
            <NoteBoundary resetKey={`${path}|${query}|${md.length}`}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHeadingIds, [rehypeHighlight, { ignoreMissing: true }], rehypeQueryMarks(query)]}
              components={{
                a({ href, children }) {
                  return (
                    <NoteLink href={href} from={path} onNavigate={onNavigate}>
                      {children}
                    </NoteLink>
                  );
                },
                img({ src, alt }) {
                  if (!src) return null;
                  const parsed = parseHref(path, src);
                  const url = parsed.type === "asset" || parsed.type === "note" ? fileUrl(parsed.path) : src;
                  return <img src={url} alt={alt ?? ""} />;
                },
                table({ children }) {
                  return (
                    <div className="table-wrap">
                      <table>{children}</table>
                    </div>
                  );
                },
                code({ className, children }) {
                  const lang = /language-([\w-]+)/.exec(className ?? "")?.[1];
                  const label = lang && lang !== "text" ? lang : undefined;
                  return (
                    <code className={className} data-lang={label}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {md}
            </Markdown>
            </NoteBoundary>
          </div>
        )}
      </article>
      <Outline items={pageOutline} activeId={activeId} onSelect={(id) => path && onNavigate(path, id)} />
    </div>
  );
}

class NoteBoundary extends Component<{ resetKey: string; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return <p className="status error">This note could not be rendered. {this.state.error}</p>;
    }
    return this.props.children;
  }
}

function NoteLink({
  href,
  from,
  onNavigate,
  children,
}: {
  href?: string;
  from: string;
  onNavigate: (path: string, hashId?: string) => void;
  children?: ReactNode;
}) {
  if (!href) return <a>{children}</a>;
  const parsed = parseHref(from, href);
  if (parsed.type === "hash") {
    return (
      <a
        href={`#${parsed.id}`}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(from, parsed.id);
        }}
      >
        {children}
      </a>
    );
  }
  if (parsed.type === "note") {
    const target = `?doc=${encodeURIComponent(parsed.path)}${parsed.id ? `#${parsed.id}` : ""}`;
    return (
      <a
        href={target}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(parsed.path, parsed.id);
        }}
      >
        {children}
      </a>
    );
  }
  if (parsed.type === "asset") {
    return (
      <a href={fileUrl(parsed.path)} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <a href={parsed.href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

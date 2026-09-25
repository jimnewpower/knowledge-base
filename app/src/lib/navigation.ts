import { useCallback, useEffect, useState } from "react";
import { contentTypes } from "./catalog";
import type { ContentType } from "./catalog";
import { isCheatSheet } from "./paths";
import type { View } from "../types";

export type LocationState = {
  q: string;
  doc: string | null;
  category: string | null;
  hash: string;
  view: View;
  type: ContentType | "all";
  tag: string;
};

export const home: LocationState = { q: "", doc: null, category: null, hash: "", view: "original", type: "all", tag: "" };

export function readLocation(url: URL): LocationState {
  const params = url.searchParams;
  let hash = url.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch { /* Preserve malformed fragment text. */ }
  const type = params.get("type") ?? "all";
  const doc = params.get("doc") || null;
  return {
    q: params.get("q") ?? "",
    doc,
    category: doc ? null : params.get("category") || null,
    hash: doc ? hash : "",
    view: params.get("view") === "enhanced" ? "enhanced" : "original",
    type: Object.hasOwn(contentTypes, type) ? type as ContentType : "all",
    tag: params.get("tag") ?? "",
  };
}

export function locationHref(location: LocationState): string {
  const params = new URLSearchParams();
  if (location.q.trim()) params.set("q", location.q.trim());
  if (location.doc) {
    params.set("doc", location.doc);
    if (location.view === "enhanced" && isCheatSheet(location.doc)) params.set("view", "enhanced");
  } else if (location.category) {
    params.set("category", location.category);
    if (location.type !== "all") params.set("type", location.type);
    if (location.tag) params.set("tag", location.tag);
  }
  const query = params.toString();
  return `${query ? `?${query}` : "?"}${location.doc && location.hash ? `#${encodeURIComponent(location.hash)}` : ""}`;
}

export type Navigate = (location: LocationState, replace?: boolean) => void;

export function useNavigation() {
  const [location, setLocation] = useState(() => readLocation(new URL(window.location.href)));
  useEffect(() => {
    const onPop = () => setLocation(readLocation(new URL(window.location.href)));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate: Navigate = useCallback((next, replace = false) => {
    const url = new URL(locationHref(next), window.location.href);
    if (url.href !== window.location.href) {
      if (replace) history.replaceState(null, "", url);
      else history.pushState(null, "", url);
    }
    setLocation(next);
  }, []);
  return { location, navigate };
}

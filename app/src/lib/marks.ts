import { queryTerms } from "./paths";

export function clearMarks(root: HTMLElement): void {
  root.querySelectorAll("mark.kb-hit").forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  });
}

function isWordChar(ch: string | undefined): boolean {
  return Boolean(ch && /[\p{L}\p{N}_]/u.test(ch));
}

function bounded(text: string, start: number, end: number): boolean {
  return !isWordChar(text[start - 1]) && !isWordChar(text[end]);
}

export function matchRanges(text: string, terms: string[]): { start: number; end: number }[] {
  if (!terms.length || !text) return [];
  const lower = text.toLowerCase();
  const found: { start: number; end: number }[] = [];
  for (const term of terms) {
    let from = 0;
    while (from < lower.length) {
      const at = lower.indexOf(term, from);
      if (at < 0) break;
      if (bounded(text, at, at + term.length)) found.push({ start: at, end: at + term.length });
      from = at + term.length;
    }
  }
  return mergeRanges(found);
}

function mergeRanges(ranges: { start: number; end: number }[]): { start: number; end: number }[] {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) last.end = Math.max(last.end, cur.end);
    else merged.push({ ...cur });
  }
  return merged;
}

export function highlightElement(root: HTMLElement, query: string): HTMLElement | null {
  clearMarks(root);
  const terms = queryTerms(query);
  if (!terms.length) return null;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    if (!el || el.closest("script, style")) continue;
    nodes.push(node as Text);
  }

  let first: HTMLElement | null = null;
  for (const textNode of nodes) {
    const text = textNode.data;
    const ranges = matchRanges(text, terms);
    if (!ranges.length) continue;

    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const range of ranges) {
      if (range.start > cursor) frag.append(text.slice(cursor, range.start));
      const mark = document.createElement("mark");
      mark.className = "kb-hit";
      mark.textContent = text.slice(range.start, range.end);
      if (!first) {
        mark.id = "kb-first-hit";
        first = mark;
      }
      frag.append(mark);
      cursor = range.end;
    }
    if (cursor < text.length) frag.append(text.slice(cursor));
    textNode.replaceWith(frag);
  }
  return first;
}

export function plainText(text: string): string {
  return text
    .replace(/^\[\^[^\]]+\]:\s*/gm, "")
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\w-]*/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*\|?[\s:-]*\|[\s|:-]*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function snippetAround(text: string, query: string, radius = 88): string {
  const terms = queryTerms(query);
  const plain = plainText(text);
  if (!terms.length || !plain) return "";
  const at = bestTermIndex(plain, terms, radius);
  if (at < 0) return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
  const start = Math.max(0, at - radius);
  const end = Math.min(plain.length, at + radius);
  const slice = plain.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < plain.length ? "…" : ""}`;
}

function bestTermIndex(plain: string, terms: string[], radius: number): number {
  const lower = plain.toLowerCase();
  const positions: number[] = [];
  for (const term of terms) {
    let from = 0;
    while (from < lower.length) {
      const at = lower.indexOf(term, from);
      if (at < 0) break;
      if (bounded(plain, at, at + term.length)) positions.push(at);
      from = at + term.length;
    }
  }
  let best = -1;
  let bestScore = -1;
  for (const at of positions) {
    const window = lower.slice(Math.max(0, at - radius), Math.min(lower.length, at + radius));
    const score = terms.reduce((count, term) => count + (window.includes(term) ? 1 : 0), 0);
    if (score > bestScore || (score === bestScore && (best < 0 || at < best))) {
      bestScore = score;
      best = at;
    }
  }
  return best;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

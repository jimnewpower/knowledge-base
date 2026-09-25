import { categories } from "../data/categories";
import type { IndexedDoc } from "../types";

export type CatalogPage = { path: string; description: string; tags: string[] };
export type Category = {
  id: string;
  title: string;
  description: string;
  startHere?: { path: string; kind: "Concepts" | "Implementation"; reason: string }[];
  sections: { title: string; pages: CatalogPage[] }[];
  related: string[];
};

export const contentTypes = {
  cheatsheet: "Cheat sheet",
  architecture: "Architecture note",
  adr: "ADR",
  runbook: "Runbook",
  note: "Note",
} as const;
export type ContentType = keyof typeof contentTypes;

export function contentType(path: string): ContentType {
  const folder = path.split("/")[0];
  if (folder === "cheatsheets" && !path.endsWith("/README.md")) return "cheatsheet";
  if (folder === "architecture") return "architecture";
  if (folder === "decisions") return "adr";
  if (folder === "runbooks") return "runbook";
  return "note";
}

export function categoryFor(path: string | null): Category | undefined {
  return categories.find((category) => category.sections.some((section) => section.pages.some((page) => page.path === path)));
}

export function pageFor(path: string): CatalogPage | undefined {
  return categoryFor(path)?.sections.flatMap((section) => section.pages).find((page) => page.path === path);
}

export function availablePages(category: Category, docs: IndexedDoc[]): CatalogPage[] {
  const paths = new Set(docs.map((doc) => doc.path));
  return category.sections.flatMap((section) => section.pages).filter((page) => paths.has(page.path));
}

export function pageTitle(doc: IndexedDoc): string {
  return doc.title.replace(/ cheat sheet$/i, "");
}

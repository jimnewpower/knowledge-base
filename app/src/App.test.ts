// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { buildSearch } from "./lib/search";
import type { IndexedDoc } from "./types";

const docs: IndexedDoc[] = [
  ["c4-diagrams", "C4 architecture diagrams", "Modeling software systems"],
  ["quality-attributes", "Quality attributes and architecture review", "Measurable quality scenarios"],
  ["spring-boot", "Spring Boot", "Application configuration"],
  ["spring-security", "Spring Security configuration", "Security filters"],
].map(([slug, title, text]) => ({ id: `cheatsheets/${slug}.md`, path: `cheatsheets/${slug}.md`, title, text }));

vi.mock("./useCorpus", () => ({ useCorpus: () => ({ tree: [], docs, mini: buildSearch(docs), revision: 1, loading: false, error: null, reload: vi.fn() }) }));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  history.replaceState(null, "", "/");
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => "# C4 architecture diagrams\n\n## Choose the view\n\nContext and containers." })));
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function click(selector: string) {
  const element = container.querySelector<HTMLElement>(selector);
  expect(element, selector).not.toBeNull();
  await act(async () => element!.click());
}

describe("category browsing", () => {
  it.each(["original", "enhanced"])("supports acronym footnotes and return links in the %s view", async (view) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => "# HTTP and TLS[^tls]\n\n## TLS[^tls] connections\n\nUse TLS[^tls].\n\n[^tls]: Transport Layer Security.\n",
    } as Response);
    history.replaceState(null, "", `/?doc=cheatsheets%2Fc4-diagrams.md&view=${view}`);
    await act(async () => root.render(createElement(App)));

    expect(container.querySelector(".prose h1")?.id).toBe("http-and-tls");
    expect(container.querySelector(".prose h2")?.id).toBe("tls-connections");
    expect(container.querySelector(".outline a")?.textContent).toBe("TLS connections");
    expect(container.querySelectorAll(".outline a")).toHaveLength(1);
    const reference = container.querySelector<HTMLAnchorElement>("a[data-footnote-ref]")!;
    expect(reference.id).toBe("user-content-fnref-tls");
    expect(document.getElementById(reference.getAttribute("aria-describedby")!)).not.toBeNull();
    const definitionId = reference.hash.slice(1);
    expect(document.getElementById(definitionId)?.textContent).toContain("Transport Layer Security.");

    await click("a[data-footnote-ref]");
    expect(window.location.hash).toBe(`#${definitionId}`);
    expect(vi.mocked(HTMLElement.prototype.scrollIntoView).mock.instances.at(-1)).toBe(document.getElementById(definitionId));
    await click("a[data-footnote-backref]");
    expect(window.location.hash).toBe(`#${reference.id}`);
    expect(vi.mocked(HTMLElement.prototype.scrollIntoView).mock.instances.at(-1)).toBe(document.getElementById(reference.id));
    for (const backref of container.querySelectorAll<HTMLAnchorElement>("a[data-footnote-backref]")) {
      expect(document.getElementById(backref.hash.slice(1))).not.toBeNull();
    }
  });

  it("keeps search scope on result navigation and restores it through history", async () => {
    history.replaceState(null, "", "/?q=security");
    await act(async () => root.render(createElement(App)));
    const scope = container.querySelector<HTMLSelectElement>(".search-scope select")!;
    await act(async () => { scope.value = "security-identity"; scope.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(window.location.search).toContain("scope=security-identity");
    expect(container.querySelectorAll(".result")).toHaveLength(1);
    await click(".result");
    expect(window.location.search).toContain("scope=security-identity");
    expect(window.location.search).toContain("doc=cheatsheets");
    await act(async () => { history.back(); await new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true })); });
    expect(container.querySelector<HTMLSelectElement>(".search-scope select")?.value).toBe("security-identity");
    await act(async () => { history.back(); await new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true })); });
    expect(container.querySelector<HTMLSelectElement>(".search-scope select")?.value).toBe("");
  });

  it("recovers from a category with no search hits without discarding the query", async () => {
    history.replaceState(null, "", "/?q=security&scope=data-persistence");
    await act(async () => root.render(createElement(App)));
    expect(container.querySelector(".search-help")?.textContent).toContain("in this category");
    await click(".search-help button");
    expect(container.querySelectorAll(".result")).toHaveLength(1);
    expect(container.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe("security");
    expect(window.location.search).not.toContain("scope=");
  });

  it("closes the mobile browse menu after choosing a category", async () => {
    await act(async () => root.render(createElement(App)));
    await click(".mobile-browse-toggle");
    expect(container.querySelector(".sidebar.mobile-open")).not.toBeNull();
    await click('.category-nav a[href="?category=architecture-design"]');
    expect(container.querySelector(".sidebar.mobile-open")).toBeNull();
    expect(container.querySelector("h1")?.textContent).toBe("Architecture & Design");
    expect(document.activeElement?.id).toBe("main-content");
  });

  it("opens a category, filters its pages, and restores state through back and forward", async () => {
    await act(async () => root.render(createElement(App)));
    expect(container.querySelectorAll(".category-card")).toHaveLength(9);
    expect(container.querySelector("h1")?.textContent).toBe("Knowledge, ready to use.");

    await click('.category-card[href="?category=architecture-design"]');
    expect(container.querySelectorAll(".page-link")).toHaveLength(2);
    const topic = container.querySelectorAll<HTMLSelectElement>(".category-filters select")[1];
    await act(async () => { topic.value = "Modeling"; topic.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(container.querySelectorAll(".page-link")).toHaveLength(1);
    expect(window.location.search).toContain("tag=Modeling");

    await click('.page-link');
    expect(container.querySelector(".breadcrumbs")?.textContent).toContain("Architecture & Design");
    expect(window.location.search).toBe("?doc=cheatsheets%2Fc4-diagrams.md");
    await act(async () => { history.back(); await new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true })); });
    expect(container.querySelectorAll(".page-link")).toHaveLength(1);
    expect(container.querySelectorAll<HTMLSelectElement>(".category-filters select")[1].value).toBe("Modeling");
    await act(async () => { history.forward(); await new Promise((resolve) => window.addEventListener("popstate", resolve, { once: true })); });
    expect(container.querySelector(".breadcrumbs")?.textContent).toContain("C4 architecture diagrams");
  });

  it("shows secondary links separately and opens the note under its primary category", async () => {
    history.replaceState(null, "", "/?category=application-development");
    await act(async () => root.render(createElement(App)));
    expect(container.querySelector(".filter-count")?.textContent).toBe("1 page");
    expect(container.querySelector(".related-topics")?.textContent).toContain("Spring Security");
    await click(".related-topics .page-link");
    expect(container.querySelector(".breadcrumbs")?.textContent).toContain("Security & Identity");
  });

  it("preserves deep-linked enhanced notes, fragments, and global search", async () => {
    history.replaceState(null, "", "/?q=C4&doc=cheatsheets%2Fc4-diagrams.md&view=enhanced#choose-the-view");
    await act(async () => root.render(createElement(App)));
    expect(container.querySelector('.prose.enhanced')).not.toBeNull();
    expect(container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe("Enhanced");
    expect(container.querySelectorAll(".result")).toHaveLength(1);
    expect(window.location.hash).toBe("#choose-the-view");
    await click('a[aria-label="Knowledge base home"]');
    expect(container.querySelectorAll(".category-card")).toHaveLength(9);
    expect(container.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe("");
  });

  it("recovers from an unknown category and from filters with no results", async () => {
    history.replaceState(null, "", "/?category=unknown");
    await act(async () => root.render(createElement(App)));
    expect(container.querySelector("h1")?.textContent).toBe("Category not found");
    await click('main a');
    await click('.category-card[href="?category=architecture-design"]');
    await act(async () => {
      history.pushState(null, "", "/?category=architecture-design&type=runbook");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(container.querySelector(".category-empty")?.textContent).toContain("No pages match");
    await click('.clear-filters');
    expect(container.querySelectorAll(".page-link")).toHaveLength(2);
  });
});

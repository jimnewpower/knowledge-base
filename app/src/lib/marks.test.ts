/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { highlightElement, snippetAround } from "./marks";

describe("snippetAround", () => {
  it("keeps acronym expansions searchable without exposing footnote markup", () => {
    const text = "TLS[^tls] protects traffic.\n\n[^tls]: Transport Layer Security.";
    expect(snippetAround(text, "transport", 100)).toBe("TLS protects traffic. Transport Layer Security.");
  });

  it("flattens table cells", () => {
    const text = "| Virtual threads (21+) | Lots of blocking I/O |";
    const snippet = snippetAround(text, "virtual threads", 40);
    expect(snippet).toContain("Virtual threads");
    expect(snippet).not.toContain("|");
  });

  it("drops heading and emphasis markers", () => {
    const text = "# Java concurrency cheat sheet\n\nConcurrency is **more than one thread**.";
    const snippet = snippetAround(text, "thread", 80);
    expect(snippet).toContain("more than one thread");
    expect(snippet).not.toContain("#");
    expect(snippet).not.toContain("**");
  });

  it("prefers a passage that contains every term", () => {
    const text = "A thread starts. Later a virtual thread parks on blocking work.";
    expect(snippetAround(text, "virtual thread", 24)).toContain("virtual thread");
  });

  it("keeps the match and the link label", () => {
    const text = "See [Java concurrency](java-concurrency.md) for virtual threads in blocking code.";
    const snippet = snippetAround(text, "virtual threads", 40);
    expect(snippet).toContain("virtual threads");
    expect(snippet).toContain("Java concurrency");
    expect(snippet).not.toContain("java-concurrency.md");
  });
});

describe("highlightElement", () => {
  it("does not mark the middle of an identifier", () => {
    document.body.innerHTML =
      "<div id='root'><p>a thread and newVirtualThreadPerTaskExecutor</p></div>";
    const root = document.getElementById("root");
    if (!root) throw new Error("missing root");
    highlightElement(root, "thread");
    const marks = [...root.querySelectorAll("mark.kb-hit")].map((mark) => mark.textContent);
    expect(marks).toEqual(["thread"]);
  });

  it("marks the query in rendered text", () => {
    document.body.innerHTML = "<div id='root'><p>Prefer virtual threads for blocking work.</p></div>";
    const root = document.getElementById("root");
    if (!root) throw new Error("missing root");
    const first = highlightElement(root, "virtual threads");
    expect(first?.id).toBe("kb-first-hit");
    expect(root.querySelectorAll("mark.kb-hit").length).toBe(2);
    expect(root.textContent).toContain("Prefer virtual threads for blocking work.");
  });
});

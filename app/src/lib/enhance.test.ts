import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import { parseFlow, rehypeEnhance } from "./enhance";

function render(markdown: string): string {
  return renderToStaticMarkup(
    createElement(Markdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeEnhance] }, markdown),
  );
}

describe("parseFlow", () => {
  it("reads a single line as a pipeline", () => {
    expect(parseFlow("validate → compile → test → package\n")).toEqual({
      kind: "pipeline",
      steps: ["validate", "compile", "test", "package"],
    });
  });

  it("reads one arrow per line as a key/value list", () => {
    expect(parseFlow("red   → write one failing test\ngreen → write the minimum code\n")).toEqual({
      kind: "map",
      rows: [
        ["red", "write one failing test"],
        ["green", "write the minimum code"],
      ],
    });
  });

  it("reads one continuation under the last arrow as a fork of the final step", () => {
    const source = "BEGIN → reads/writes → COMMIT\n                    → ROLLBACK\n";
    expect(parseFlow(source)).toEqual({
      kind: "pipeline",
      steps: ["BEGIN", "reads/writes"],
      fork: ["COMMIT", "ROLLBACK"],
    });
  });

  it("leaves several continuation lines alone because they may be a sequence", () => {
    const source = "ClientHello → ServerHello\n           → key exchange\n           → Finished\n";
    expect(parseFlow(source)).toBeNull();
  });

  it("leaves fences with lines that have no arrow alone", () => {
    expect(parseFlow("attempt 1 → fail\nwait 100ms + jitter\nattempt 2 → fail\n")).toBeNull();
  });
});

describe("rehypeEnhance", () => {
  it("turns the baseline line into labelled baseline and review date", () => {
    const html = render("# Sheet\n\n> Baseline: `Java` 21 LTS. Reviewed: 2026-09-24.\n");
    expect(html).toContain('<dl class="kb-meta">');
    expect(html).toContain("<dt>Baseline</dt><dd><code>Java</code> 21 LTS.</dd>");
    expect(html).toContain("<dt>Reviewed</dt><dd>2026-09-24</dd>");
    expect(html).not.toContain("<blockquote>");
  });

  it("splits a plain-text baseline line", () => {
    const html = render("> Baseline: PostgreSQL 16 examples. Reviewed: 2026-09-24.\n");
    expect(html).toContain("<dt>Baseline</dt><dd>PostgreSQL 16 examples.</dd>");
    expect(html).toContain("<dt>Reviewed</dt><dd>2026-09-24</dd>");
  });

  it("leaves other blockquotes as quotes", () => {
    expect(render("> Keep transactions short.\n")).toContain("<blockquote>");
  });

  it("chips a leading yes/no/possible and keeps the rest of the cell", () => {
    const html = render(
      "| Level | Phantom | Idempotent |\n|---|---|---|\n| Repeatable read | possible (PG: no, MVCC) | not necessarily |\n| Serializable | no | yes |\n",
    );
    expect(html).toContain('<span class="kb-chip on">possible</span> (PG: no, MVCC)');
    expect(html).toContain('<td><span class="kb-chip off">no</span></td>');
    expect(html).toContain('<td><span class="kb-chip on">yes</span></td>');
    expect(html).toContain("<td>not necessarily</td>");
    expect(html).toContain("<th>Level</th>");
  });

  it("replaces a pipeline fence with an ordered list and keeps other code blocks", () => {
    const html = render("```text\nlocal → ci → prod\n```\n\n```sql\nSELECT 1 → 2;\n```\n");
    expect(html).toContain(
      '<ol class="kb-flow"><li><span class="kb-step">local</span></li><li><span class="kb-step">ci</span></li><li><span class="kb-step">prod</span></li></ol>',
    );
    expect(html).toContain('<code class="language-sql">SELECT 1 → 2;\n</code>');
  });

  it("renders every cheat sheet, splitting its baseline line", () => {
    const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../cheatsheets");
    const sheets = fs.readdirSync(dir).filter((name) => name.endsWith(".md") && name !== "README.md");
    expect(sheets.length).toBeGreaterThan(0);
    const missing = sheets.filter((name) => {
      const html = render(fs.readFileSync(path.join(dir, name), "utf8"));
      return !html.includes('<dl class="kb-meta">') || html.includes("Reviewed:");
    });
    expect(missing).toEqual([]);
  }, 15_000);
});

// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { act, createElement } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { inspectMarkdown } from "./content";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function example(sheet: string, language: string): string {
  const text = fs.readFileSync(path.join(appRoot, "..", "cheatsheets", `${sheet}.md`), "utf8");
  const examples = inspectMarkdown(text).examples.filter((node) => node.lang === language);
  expect(examples, `${sheet}: expected one ${language} example`).toHaveLength(1);
  return examples[0].value!;
}

describe("complete examples in the published sheets", () => {
  it("type-checks the React module against the installed React types", () => {
    const source = example("react", "tsx");
    const filename = path.join(appRoot, "content-example.tsx");
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
      strict: true, noEmit: true, skipLibCheck: true, types: ["react"],
    };
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (name, version, onError, fresh) => path.resolve(name) === filename
      ? ts.createSourceFile(name, source, version, true, ts.ScriptKind.TSX)
      : getSourceFile(name, version, onError, fresh);
    const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host));
    expect(diagnostics.map((item) => ts.flattenDiagnosticMessageText(item.messageText, "\n"))).toEqual([]);
  });

  it("filters the actual React example and announces an empty result", async () => {
    const output = ts.transpileModule(example("react", "tsx"), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const module = { exports: {} as { default: ComponentType<{ topics: string[] }> } };
    new Function("require", "module", "exports", output)(createRequire(import.meta.url), module, module.exports);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () => root.render(createElement(module.exports.default, { topics: ["Java", "React", "SQL"] })));
      const input = container.querySelector("input")!;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      await act(async () => { setter.call(input, " REA "); input.dispatchEvent(new Event("input", { bubbles: true })); });
      expect([...container.querySelectorAll("li")].map((item) => item.textContent)).toEqual(["React"]);
      await act(async () => { setter.call(input, "missing"); input.dispatchEvent(new Event("input", { bubbles: true })); });
      expect(container.querySelector('[role="status"]')?.textContent).toBe("0 matches");
      expect(container.querySelectorAll("li")).toHaveLength(0);
    } finally {
      await act(async () => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  });

  it("formats explicit currencies/locales and crosses a day boundary in the requested zone", () => {
    const api = vm.runInNewContext(`${example("localization", "javascript")}\n({ formatPrice, formatInstant });`);
    expect(api.formatPrice(1234.5, "de-DE", "EUR")).toContain("1.234,50");
    expect(api.formatPrice(1234.5, "de-DE", "EUR")).toContain("€");
    expect(api.formatPrice(1234.5, "en-US", "USD")).toContain("1,234.50");
    const instant = "2026-09-25T01:00:00Z";
    expect(api.formatInstant(instant, "en-US", "UTC")).toContain("Sep 25");
    expect(api.formatInstant(instant, "en-US", "America/Denver")).toContain("Sep 24");
  });
});

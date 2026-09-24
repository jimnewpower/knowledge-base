/**
 * Presentation-only rewrites for the enhanced cheat-sheet view. Each rule recognises a
 * convention the sheets already follow and leaves anything irregular untouched, so the
 * original Markdown stays the single source.
 */

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
};

const ARROW = "→";
const REVIEWED = /\s*Reviewed:\s*(\S+?)\.?\s*$/;
const CHIP_WORD = /^(yes|no|possible)(?=$|[;,]|\s\()/i;

function el(tagName: string, className: string | null, children: HastNode[]): HastNode {
  return { type: "element", tagName, properties: className ? { className: [className] } : {}, children };
}

function text(value: string): HastNode {
  return { type: "text", value };
}

function isElement(node: HastNode | undefined, tagName: string): node is HastNode {
  return node?.type === "element" && node.tagName === tagName;
}

function classes(node: HastNode): string[] {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.map(String) : [];
}

export function rehypeEnhance() {
  return (tree: HastNode) => {
    enhanceBaseline(tree);
    visit(tree);
  };
}

function visit(node: HastNode): void {
  const children = node.children ?? [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isElement(child, "pre")) {
      const flow = flowFromPre(child);
      if (flow) {
        children[i] = flow;
        continue;
      }
    }
    if (isElement(child, "tbody")) {
      for (const row of child.children ?? []) {
        for (const cell of row.children ?? []) {
          if (isElement(cell, "td")) chipCell(cell);
        }
      }
      continue;
    }
    visit(child);
  }
}

/** `> Baseline: … Reviewed: 2026-09-24.` becomes a labelled pair. Only the first top-level blockquote qualifies. */
function enhanceBaseline(tree: HastNode): void {
  const children = tree.children ?? [];
  const index = children.findIndex((node) => isElement(node, "blockquote"));
  if (index < 0) return;
  const paragraphs = (children[index].children ?? []).filter((node) => isElement(node, "p"));
  if (paragraphs.length !== 1) return;
  const inline = paragraphs[0].children ?? [];
  const first = inline[0];
  const last = inline[inline.length - 1];
  if (first?.type !== "text" || !first.value?.startsWith("Baseline:")) return;
  if (last?.type !== "text" || !last.value) return;
  const reviewed = REVIEWED.exec(last.value);
  if (!reviewed) return;

  // Cut the tail before the head: with plain text they are the same node, and the match index is into the uncut value.
  const body = inline.map((node) => ({ ...node }));
  const tail = body[body.length - 1];
  tail.value = tail.value!.slice(0, reviewed.index).trimEnd();
  body[0].value = body[0].value!.slice("Baseline:".length).trimStart();
  if (!tail.value) body.pop();

  children[index] = el("dl", "kb-meta", [
    el("div", null, [el("dt", null, [text("Baseline")]), el("dd", null, body)]),
    el("div", null, [el("dt", null, [text("Reviewed")]), el("dd", null, [text(reviewed[1])])]),
  ]);
}

type Flow =
  | { kind: "pipeline"; steps: string[]; fork?: string[] }
  | { kind: "map"; rows: [string, string][] };

/**
 * Reads a `text` fence as a flow when it has one of three regular shapes:
 * a single-line pipeline, one `key → value` per line, or a pipeline whose final step
 * has one alternative on a continuation line under the last arrow. More continuation
 * lines stay plain: a column of arrows is as likely to be a sequence as a fork.
 */
export function parseFlow(source: string): Flow | null {
  const lines = source.replace(/\s+$/, "").split(/\r?\n/);
  if (lines.some((line) => !line.includes(ARROW))) return null;

  const firstSteps = splitSteps(lines[0]);
  if (!firstSteps || lines[0].trimStart().startsWith(ARROW)) return null;
  if (lines.length === 1) return { kind: "pipeline", steps: firstSteps };

  if (lines.length === 2 && lines[1].trimStart().startsWith(ARROW)) {
    const alternative = lines[1].trim().slice(ARROW.length).trim();
    // Hand-aligned fences drift by a column or two.
    const aligned = Math.abs(lines[1].indexOf(ARROW) - lines[0].lastIndexOf(ARROW)) <= 2;
    if (!alternative || alternative.includes(ARROW) || !aligned || firstSteps.length < 2) return null;
    return { kind: "pipeline", steps: firstSteps.slice(0, -1), fork: [firstSteps[firstSteps.length - 1], alternative] };
  }

  const rows: [string, string][] = [];
  for (const line of lines) {
    const parts = line.split(ARROW);
    if (parts.length !== 2 || /^\s/.test(line)) return null;
    const key = parts[0].trim();
    const value = parts[1].trim();
    if (!key || !value) return null;
    rows.push([key, value]);
  }
  return { kind: "map", rows };
}

function splitSteps(line: string): string[] | null {
  const steps = line.split(ARROW).map((step) => step.trim());
  if (steps.length < 2 || steps.some((step) => !step)) return null;
  return steps;
}

function flowFromPre(pre: HastNode): HastNode | null {
  const code = pre.children?.find((node) => isElement(node, "code"));
  if (!code || !classes(code).includes("language-text")) return null;
  const only = code.children ?? [];
  if (only.length !== 1 || only[0].type !== "text" || !only[0].value) return null;
  const flow = parseFlow(only[0].value);
  if (!flow) return null;

  if (flow.kind === "map") {
    return el(
      "dl",
      "kb-map",
      flow.rows.map(([key, value]) =>
        el("div", null, [el("dt", null, [text(key)]), el("dd", null, [text(value)])]),
      ),
    );
  }
  const step = (label: string) => el("li", null, [el("span", "kb-step", [text(label)])]);
  const steps = flow.steps.map(step);
  if (flow.fork) steps.push(el("li", "kb-fork", [el("ul", null, flow.fork.map(step))]));
  return el("ol", "kb-flow", steps);
}

/** A cell that opens with yes/no/possible gets a neutral on/off chip; the rest of the cell is kept. */
function chipCell(cell: HastNode): void {
  const first = cell.children?.[0];
  if (first?.type !== "text" || !first.value) return;
  const leading = first.value.trimStart();
  const match = CHIP_WORD.exec(leading);
  if (!match) return;
  const word = match[1];
  const state = word.toLowerCase() === "no" ? "kb-chip off" : "kb-chip on";
  const chip: HastNode = {
    type: "element",
    tagName: "span",
    properties: { className: state.split(" ") },
    children: [text(word)],
  };
  const rest = leading.slice(word.length);
  cell.children!.splice(0, 1, chip, ...(rest ? [text(rest)] : []));
}

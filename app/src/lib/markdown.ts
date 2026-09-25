export type Heading = {
  depth: number;
  text: string;
};

const FENCE = /^ {0,3}(```+|~~~+)/;
const HEADING = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;

function fenceMarker(line: string): "```" | "~~~" | null {
  const match = FENCE.exec(line);
  if (!match) return null;
  return match[1].startsWith("~") ? "~~~" : "```";
}

function closesFence(line: string, marker: "```" | "~~~"): boolean {
  return new RegExp(`^ {0,3}${marker}+\\s*$`).test(line);
}

/** Drop inline emphasis and link markup so titles stay readable. */
export function cleanInline(text: string): string {
  return text
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function allHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let fence: "```" | "~~~" | null = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (fence) {
      if (closesFence(line, fence)) fence = null;
      continue;
    }
    const opened = fenceMarker(line);
    if (opened) {
      fence = opened;
      continue;
    }
    const match = HEADING.exec(line);
    if (!match) continue;
    headings.push({
      depth: match[1].length,
      text: cleanInline(match[2]),
    });
  }
  return headings;
}

export function titleOf(markdown: string, fallback: string): string {
  const heading = allHeadings(markdown).find((item) => item.depth === 1);
  return heading?.text || fallback;
}

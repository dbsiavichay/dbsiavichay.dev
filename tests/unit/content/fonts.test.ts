import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import subset from "@/fonts/subset.json";

/** Geist has no ⌘ at all: the system font has always drawn it. */
const SYSTEM_FONT = new Set(["⌘"]);

/** Its slugify regex names combining marks to strip them; none is rendered. */
const NEVER_RENDERED = new Set(["src/lib/mdx-source.ts"]);

const ranges = subset.unicodes.map((range) => {
  const [start, end] = range.replace("U+", "").split("-");
  const first = parseInt(start!, 16);
  return [first, end ? parseInt(end, 16) : first] as const;
});

const inSubset = (codePoint: number) =>
  ranges.some(([start, end]) => codePoint >= start && codePoint <= end);

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx|mdx)$/.test(entry.name)) yield full;
  }
}

const hex = (codePoint: number) =>
  `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;

describe("font subsets", () => {
  it("cover every character the site writes", () => {
    const missing = new Set<string>();
    for (const file of sourceFiles("src")) {
      if (NEVER_RENDERED.has(file)) continue;
      for (const char of readFileSync(file, "utf8")) {
        const codePoint = char.codePointAt(0)!;
        if (codePoint < 0x20 || SYSTEM_FONT.has(char)) continue;
        if (!inSubset(codePoint)) {
          missing.add(`${file}: "${char}" ${hex(codePoint)}`);
        }
      }
    }
    // Add the range to src/fonts/subset.json and run scripts/subset-fonts.mjs.
    expect([...missing]).toEqual([]);
  });

  it("are the files the layout loads", () => {
    const loader = readFileSync("src/fonts/index.ts", "utf8");
    for (const output of Object.values(subset.fonts)) {
      expect(loader).toContain(`"./${output}"`);
      expect(readdirSync("src/fonts")).toContain(output);
    }
  });
});

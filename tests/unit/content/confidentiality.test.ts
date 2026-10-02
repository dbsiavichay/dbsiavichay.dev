import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/config";
import { getNotes, getSlugs } from "@/lib/content";
import { extractBody } from "@/lib/mdx-source";

/**
 * Words that must never be published: the shop's existing inventory system,
 * the names of the salon's product, a customer of the shop. The repository is
 * public, so they are listed as SHA-256 hashes rather than spelled out.
 */
const FORBIDDEN = new Set([
  "c58106bbcfc89023cb2d2a773138bbe6ed8feba06241cdc4fcacf7df404c00c3",
  "62bd9942f0b0662f25e5b58771b6d2da3b9103b8545fb89ef986fe508cd0bd40",
  "1ed29574104b4362b25e1d9e7501ea3486e87e404ee22891e024917127ec963e",
  "7417f16d7781bfc49fe796668aa57a231812146a528ce3cb4c41ddb543a33bb1",
]);

const sha256 = (word: string) =>
  createHash("sha256").update(word).digest("hex");

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx|mdx|css|svg)$/.test(entry.name)) yield full;
  }
}

/**
 * Maderable is a client that allows its name and architecture to be
 * published, never its figures: no amounts, percentages, timings or speedups
 * in anything written from its work.
 */
const FIGURE =
  /\$\s?\d|\b(usd|dólares|dollars)\b|\d\s?%|\b\d+(\.\d+)?\s?(ms|s|seg|seconds|segundos|minutes|minutos)\b|\b\d+(\.\d+)?\s?[x×]\b/i;

describe("confidentiality", () => {
  it("never names what must stay private", () => {
    for (const file of sourceFiles(path.join(process.cwd(), "src"))) {
      const words = readFileSync(file, "utf8")
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u);
      for (const word of words) {
        expect(FORBIDDEN.has(sha256(word)), `${file}: "${word}"`).toBe(false);
      }
    }
  });

  it("publishes no figures from Maderable's work", async () => {
    const notes = await getNotes("en");
    const sources = [
      ...getSlugs("projects")
        .filter((slug) => slug === "maderable")
        .map((slug) => `projects/${slug}`),
      ...notes
        .filter((note) => note.projects.includes("maderable"))
        .map((note) => `notes/${note.slug}`),
    ];
    expect(sources.length).toBeGreaterThan(1);

    for (const source of sources) {
      for (const locale of locales) {
        const file = path.join("src", "content", source, `${locale}.mdx`);
        const body = extractBody(readFileSync(file, "utf8"));
        expect(body.match(FIGURE)?.[0], file).toBeUndefined();
      }
    }
  });
});

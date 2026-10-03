import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { themeColors } from "@/lib/theme-colors";

const css = readFileSync("src/app/globals.css", "utf8");

type Rgba = [r: number, g: number, b: number, a: number];
type Theme = Map<string, string>;

/** The `--name: value;` declarations of the first `:root` block after `from`. */
function rootTokens(from: number): Theme {
  const open = css.indexOf(":root {", from);
  const body = css.slice(open, css.indexOf("}", open));
  return new Map(
    [...body.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].map(
      ([, name, value]) => [name!, value!.trim()],
    ),
  );
}

const darkTokens = rootTokens(0);
const lightOverrides = rootTokens(
  css.indexOf("@media (prefers-color-scheme: light)"),
);
const themes: Record<string, Theme> = {
  dark: darkTokens,
  light: new Map([...darkTokens, ...lightOverrides]),
};

function parse(value: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgb =
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+))?\s*\)$/.exec(
      value,
    );
  if (rgb) {
    const [, r, g, b, a] = rgb;
    return [Number(r), Number(g), Number(b), a === undefined ? 1 : Number(a)];
  }
  if (value === "transparent") return [0, 0, 0, 0];
  throw new Error(`Unparsed colour: ${value}`);
}

/** A token's colour in a theme, following `var()` references. */
function color(theme: Theme, name: string): Rgba {
  const value = theme.get(name);
  if (value === undefined) throw new Error(`No token --${name}`);
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  return ref ? color(theme, ref[1]!) : parse(value);
}

/** A translucent colour as it shows over an opaque one. */
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: Rgba) {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio. */
function contrast(a: Rgba, b: Rgba) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const TEXT = 4.5;
const NON_TEXT = 3;

/** [foreground, background, minimum] in both themes. */
const pairs: [string, string, number][] = [];
for (const bg of ["canvas", "surface", "raised"]) {
  for (const fg of [
    "fg",
    "fg-muted",
    "fg-subtle",
    "accent-text",
    "signal-info",
    "signal-ok",
    "signal-error",
  ]) {
    pairs.push([fg, bg, TEXT]);
  }
  // Control outlines and the focus ring (WCAG 1.4.11).
  pairs.push(["line-strong", bg, NON_TEXT], ["focus", bg, NON_TEXT]);
}
pairs.push(
  ["on-accent", "accent", TEXT],
  ["on-accent", "accent-hover", TEXT],
  ["keycap-fg", "keycap", TEXT],
  ["keycap-fg", "keycap-pressed", TEXT],
  ["keycap-edge", "canvas", NON_TEXT],
  ["keycap-edge", "surface", NON_TEXT],
);
for (const bg of ["term", "term-bar"]) {
  for (const fg of [
    "term-fg",
    "term-muted",
    "term-accent",
    "term-ok",
    "syn-string",
    "syn-keyword",
    "syn-function",
    "syn-number",
    "syn-comment",
  ]) {
    pairs.push([fg, bg, TEXT]);
  }
  pairs.push(["term-line-strong", bg, NON_TEXT]);
}
// The legend of the keycap drawn in the terminal's output.
pairs.push(["term-fg", "term-key", TEXT]);

describe.each(Object.entries(themes))("%s tokens", (_, theme) => {
  it.each(pairs)("--%s on --%s is ≥ %s:1", (fg, bg, minimum) => {
    expect(contrast(color(theme, fg), color(theme, bg))).toBeGreaterThanOrEqual(
      minimum,
    );
  });

  it.each(["canvas", "surface"])(
    "accent text on the soft accent over --%s is ≥ 4.5:1",
    (bg) => {
      const base = color(theme, bg);
      const badge = over(color(theme, "accent-soft"), base);
      expect(
        contrast(color(theme, "accent-text"), badge),
      ).toBeGreaterThanOrEqual(TEXT);
    },
  );
});

describe("design tokens", () => {
  it("keep the terminal and code dark in the light theme", () => {
    const overridden = [...lightOverrides.keys()].filter((name) =>
      /^(term|syn)(-|$)/.test(name),
    );
    expect(overridden).toEqual([]);
  });

  it("are mirrored exactly where CSS can't reach", () => {
    for (const [scheme, values] of Object.entries(themeColors)) {
      for (const [name, value] of Object.entries(values)) {
        expect([scheme, name, parse(value)]).toEqual([
          scheme,
          name,
          color(themes[scheme]!, name),
        ]);
      }
    }
  });

  it("paint the favicon", () => {
    const icon = readFileSync("src/app/icon.svg", "utf8");
    for (const name of ["canvas", "line-strong", "accent"]) {
      expect(icon).toContain(darkTokens.get(name));
    }
  });
});

import localFont from "next/font/local";

/**
 * Geist (SIL OFL 1.1, see OFL.txt), subset to the characters the site writes:
 * Latin and Latin-1 (all of Spanish), typographic punctuation and a few
 * arrows, as listed in subset.json. Every page preloads both fonts, so the
 * full variable files cost 138 KB before the first paint; the subsets keep
 * the weight axis and every OpenType feature in about 62 KB.
 * `scripts/subset-fonts.mjs` regenerates them. The options match the `geist`
 * package's own, so the text and its fallbacks render the same.
 */
export const GeistSans = localFont({
  src: "./geist-sans-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const GeistMono = localFont({
  src: "./geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  adjustFontFallback: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  weight: "100 900",
});

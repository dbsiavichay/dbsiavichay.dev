/**
 * The tokens needed where CSS variables can't reach: the image renderer of
 * the OG cards and the browser's `theme-color`. Keys are token names in
 * src/app/globals.css, and tests/unit/app/tokens.test.ts keeps every value
 * equal to its token.
 */
export const themeColors = {
  dark: {
    canvas: "#0c0b0a",
    fg: "#eeeae3",
    "fg-muted": "#aaa398",
    "fg-subtle": "#8f887c",
    "line-strong": "#6e675d",
    accent: "#f2a541",
    // The image renderer reads the comma syntax.
    grid: "rgba(238, 234, 227, 0.04)",
  },
  light: {
    canvas: "#f5f3ef",
  },
} as const;

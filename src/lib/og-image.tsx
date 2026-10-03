import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { env } from "./env";
import { themeColors } from "./theme-colors";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fontDir = path.join(process.cwd(), "node_modules/geist/dist/fonts");

let fonts: Promise<[Buffer, Buffer]> | undefined;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(path.join(fontDir, "geist-sans/Geist-SemiBold.ttf")),
    readFile(path.join(fontDir, "geist-mono/GeistMono-Regular.ttf")),
  ]);
  return fonts;
}

// The image renderer can't read CSS variables.
const colors = themeColors.dark;
const line = colors["line-strong"];

type OgCard = {
  /** Mono label above the title. */
  eyebrow: string;
  title: string;
  /** A line under the title, for pages that have one. */
  subtitle?: string;
};

/**
 * The card shown when a page of the site is shared: a drafting grid, a mono
 * label, the title and a dimension line with the site's host. Rendered at
 * build time.
 */
export async function renderOgImage({ eyebrow, title, subtitle }: OgCard) {
  const [geistSemiBold, geistMono] = await loadFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: colors.canvas,
        backgroundImage: `linear-gradient(to right, ${colors.grid} 1px, transparent 1px), linear-gradient(to bottom, ${colors.grid} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        color: colors.fg,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 24,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: colors["fg-subtle"],
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            maxWidth: 1000,
            fontSize: subtitle ? 68 : 76,
            lineHeight: 1.05,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              maxWidth: 960,
              fontSize: 32,
              lineHeight: 1.3,
              color: colors["fg-muted"],
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 1, height: 22, backgroundColor: line }} />
        <div style={{ flexGrow: 1, height: 1, backgroundColor: line }} />
        <div
          style={{
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 26,
            color: colors.accent,
          }}
        >
          {new URL(env.SITE_URL).host}
        </div>
        <div style={{ width: 1, height: 22, backgroundColor: line }} />
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: geistMono, weight: 400, style: "normal" },
      ],
    },
  );
}

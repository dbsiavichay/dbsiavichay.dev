import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { env } from "@/lib/env";

// Language-neutral on purpose: the name and the job title read the same in both.
export const alt = "Denis Siavichay — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const fonts = path.join(process.cwd(), "node_modules/geist/dist/fonts");
const [geistSemiBold, geistMono] = await Promise.all([
  readFile(path.join(fonts, "geist-sans/Geist-SemiBold.ttf")),
  readFile(path.join(fonts, "geist-mono/GeistMono-Regular.ttf")),
]);

// The image renderer can't read CSS variables: these mirror the dark tokens
// in globals.css (canvas, fg, fg-subtle, line-strong, accent, grid).
const colors = {
  canvas: "#0a0b0d",
  fg: "#ecebe8",
  subtle: "#868e99",
  line: "#5f6670",
  accent: "#f2a541",
  grid: "rgba(255, 255, 255, 0.035)",
};

/** The card shown when a page of the site is shared. Rendered at build time. */
export default async function OpengraphImage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

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
          color: colors.subtle,
        }}
      >
        {dict.hero.eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 960,
          fontSize: 76,
          lineHeight: 1.05,
          letterSpacing: -1.5,
        }}
      >
        {dict.hero.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 1, height: 22, backgroundColor: colors.line }} />
        <div style={{ flexGrow: 1, height: 1, backgroundColor: colors.line }} />
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
        <div style={{ width: 1, height: 22, backgroundColor: colors.line }} />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: geistMono, weight: 400, style: "normal" },
      ],
    },
  );
}

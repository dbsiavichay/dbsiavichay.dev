import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import {
  Cursor,
  Prompt,
  TerminalWindow,
} from "@/components/terminal/terminal-window";
import { profile } from "@/data/profile";
import { locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatBuildTime, getBuildInfo } from "@/lib/build-info";
import { pageHref } from "@/lib/content";
import { SEPARATOR } from "@/lib/separator";
import { cn } from "@/lib/utils";

const linkClass =
  "text-term-fg underline decoration-term-line-strong underline-offset-4 transition-colors hover:decoration-term-accent";

/** The site's own palette, where neofetch prints the terminal's colours. */
const palette = [
  "bg-canvas",
  "bg-raised",
  "bg-line-strong",
  "bg-fg-subtle",
  "bg-fg-muted",
  "bg-fg",
  "bg-accent",
  "bg-signal-ok",
];

// The entrance, with motion only: the window rises, `build-info` is typed,
// then the output is printed line by line and the cursor blinks.
const TYPE_AT = 650;
const PRINT_AT = TYPE_AT + 650;
const LINE_GAP = 45;

const printed = "motion-safe:animate-appear";
const printAt = (line: number): CSSProperties => ({
  animationDelay: `${PRINT_AT + line * LINE_GAP}ms`,
});

/** A narrow terminal wraps a path between its segments, not inside a name. */
function breakAfterSlashes(path: string) {
  return path.split("/").map((segment, i) => (
    <Fragment key={i}>
      {i > 0 ? (
        <>
          /<wbr />
        </>
      ) : null}
      {segment}
    </Fragment>
  ));
}

/**
 * The site describes itself, as neofetch would: commit, build time and
 * toolchain are read from the build that rendered the page, not written by
 * hand. The commands are decoration; the output is a `dl` anyone can read.
 */
export async function SystemStatus({ className }: { className?: string }) {
  const { locale, dict } = await getI18n();
  const build = getBuildInfo();
  const t = dict.status;
  const directory = profile.repository.split("/").pop();

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: t.commit,
      value: build.commitUrl ? (
        <a href={build.commitUrl} className={linkClass}>
          {build.shortSha}
          <span className="sr-only">, {t.viewCommit}</span>
        </a>
      ) : (
        `${build.shortSha}${SEPARATOR}${t.localBuild}`
      ),
    },
    {
      label: t.built,
      value: (
        <time dateTime={build.builtAt}>{formatBuildTime(build.builtAt)}</time>
      ),
    },
    {
      label: t.toolchain,
      value: `Next.js ${build.nextVersion}${SEPARATOR}Node ${build.nodeVersion}`,
    },
    { label: t.rendering, value: t.renderingValue },
    { label: t.languages, value: locales.join(SEPARATOR) },
    {
      label: t.source,
      value: (
        <a href={profile.repository} className={linkClass}>
          {breakAfterSlashes(profile.repository.replace(/^https:\/\//, ""))}
        </a>
      ),
    },
  ];
  const lines = rows.length;

  return (
    <TerminalWindow
      aria-labelledby="status-title"
      className={className}
      title={
        <h2 id="status-title" className="flex min-w-0">
          <span aria-hidden="true" className="truncate">
            ~/{directory}
          </span>
          <span aria-hidden="true" className="shrink-0 whitespace-pre">
            {" — "}
          </span>
          <span className="shrink-0 lowercase">{t.title}</span>
        </h2>
      }
      status={
        <>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-term-ok"
            />
            {t.mode}
          </span>
          <Link
            href={pageHref(locale, "colophon")}
            className={cn(linkClass, "inline-block py-1")}
          >
            {t.colophon} <span aria-hidden="true">→</span>
          </Link>
        </>
      }
    >
      <Prompt command="build-info" typeAfter={TYPE_AT} />
      <div className="mt-4 flex gap-5">
        {/* neofetch's logo: the monogram's keycap, in the terminal's colours. */}
        <span
          aria-hidden="true"
          className={cn(
            "hidden size-16 shrink-0 keycap place-items-center rounded-[9px] text-lg font-semibold [--keycap-depth:4px] [--keycap-edge:var(--term-key-edge)] [--keycap-fg:var(--term-fg)] [--keycap:var(--term-key)] xl:grid",
            printed,
          )}
          style={printAt(0)}
        >
          DS
        </span>
        <div className="min-w-0 flex-1">
          <dl className="grid grid-cols-[10ch_minmax(0,1fr)] gap-x-3 gap-y-0.5">
            {rows.map((row, line) => (
              <div key={row.label} className="contents">
                <dt
                  className={cn("text-term-accent", printed)}
                  style={printAt(line)}
                >
                  {row.label}
                </dt>
                <dd
                  className={cn("[overflow-wrap:anywhere]", printed)}
                  style={printAt(line)}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div
            aria-hidden="true"
            className={cn("mt-3.5 flex", printed)}
            style={printAt(lines)}
          >
            {palette.map((color) => (
              <span
                key={color}
                className={cn(
                  "h-3.5 w-[18px] first:outline first:outline-term-line",
                  color,
                )}
              />
            ))}
          </div>
        </div>
      </div>
      {/* The caption, as a shell comment: the hanging indent keeps the `#` alone. */}
      <p
        className={cn("mt-4 pl-[2ch] -indent-[2ch] text-syn-comment", printed)}
        style={printAt(lines + 1)}
      >
        <span aria-hidden="true"># </span>
        {t.caption}
      </p>
      <Prompt className={cn("mt-3", printed)} style={printAt(lines + 2)}>
        <Cursor blinkAfter={PRINT_AT + (lines + 2) * LINE_GAP} />
      </Prompt>
    </TerminalWindow>
  );
}

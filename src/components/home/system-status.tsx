import type { ReactNode } from "react";

import { profile } from "@/data/profile";
import { locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatBuildTime, getBuildInfo } from "@/lib/build-info";
import { SEPARATOR } from "@/lib/separator";
import { cn } from "@/lib/utils";

const linkClass =
  "text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent";

/**
 * The site describes itself: commit, build time and toolchain are read from
 * the build that rendered the page, not written by hand.
 */
export async function SystemStatus({ className }: { className?: string }) {
  const { dict } = await getI18n();
  const build = getBuildInfo();
  const t = dict.status;

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
          {profile.repository.replace(/^https:\/\//, "")}
        </a>
      ),
    },
  ];

  return (
    <section
      aria-labelledby="status-title"
      className={cn("rounded-lg border border-line bg-surface", className)}
    >
      <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2
          id="status-title"
          className="flex items-center gap-2 label-mono text-fg"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-signal-ok"
          />
          {t.title}
        </h2>
        <span className="label-mono text-fg-subtle">{t.mode}</span>
      </header>
      <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 px-5 py-4 font-mono text-xs leading-5">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-fg-subtle">{row.label}</dt>
            <dd className="[overflow-wrap:anywhere] text-fg-muted">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-line px-5 py-3 text-xs text-fg-subtle">
        {t.caption}
      </p>
    </section>
  );
}

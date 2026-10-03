import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { openSource } from "@/data/open-source";
import { getI18n } from "@/i18n/server";
import type { Project } from "@/lib/content";
import { formatYearRange } from "@/lib/dates";

import {
  CompactProjectCard,
  FeaturedProjectCard,
  ProjectCard,
} from "./project-card";

const linkClass =
  "underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent";

export async function FeaturedWork({ projects }: { projects: Project[] }) {
  const { locale, dict } = await getI18n();
  const t = dict.work;

  return (
    <Section id="work" labelledBy="work-title">
      <SectionHeader
        index="02"
        eyebrow={t.eyebrow}
        titleId="work-title"
        title={t.title}
        lede={t.lede}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          switch (project.tier) {
            case "featured":
              return (
                <FeaturedProjectCard
                  key={project.slug}
                  project={project}
                  dict={dict}
                  className="reveal md:col-span-2"
                />
              );
            case "standard":
              return (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  dict={dict}
                  className="reveal"
                />
              );
            case "compact":
              return (
                <CompactProjectCard
                  key={project.slug}
                  project={project}
                  dict={dict}
                  className="reveal md:col-span-2"
                />
              );
          }
        })}
      </div>

      <div className="mt-16 lg:mt-20">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h3 className="label-mono text-fg">{t.openSource.title}</h3>
          <p className="text-sm text-fg-subtle">{t.openSource.lede}</p>
        </div>
        <ul className="mt-6 grid gap-x-8 gap-y-10 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {openSource.map((pkg) => (
            <li key={pkg.name} className="flex flex-col">
              {/* The command that installs it: the package is on PyPI. */}
              <h4 className="path-mono text-fg">
                <span aria-hidden="true" className="text-fg-subtle">
                  <span className="text-accent-text">$</span> pip install{" "}
                </span>
                <span className="whitespace-nowrap">{pkg.name}</span>
              </h4>
              <p className="mt-2 grow text-sm text-fg-muted">
                {pkg.description[locale]}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-fg-subtle">
                <span>
                  <span className="sr-only">{t.openSource.releases}: </span>
                  {formatYearRange(
                    pkg.releases.first,
                    pkg.releases.last,
                    dict.common.present,
                  )}
                </span>
                <a href={pkg.pypi} className={linkClass}>
                  {t.openSource.pypi}
                  <span className="sr-only">: {pkg.name}</span>
                </a>
                <a href={pkg.repository} className={linkClass}>
                  {t.openSource.source}
                  <span className="sr-only">: {pkg.name}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

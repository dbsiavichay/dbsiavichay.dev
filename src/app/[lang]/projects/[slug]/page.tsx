import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article/article-body";
import {
  ArticleHeader,
  EyebrowRule,
} from "@/components/article/article-header";
import { NextLink } from "@/components/article/next-link";
import { NoteList } from "@/components/article/note-list";
import { Container } from "@/components/ui/container";
import { PendingList } from "@/components/ui/pending";
import { StackLine } from "@/components/ui/stack-line";
import { TextLink } from "@/components/ui/text-link";
import { getI18n } from "@/i18n/server";
import {
  getBody,
  getNotes,
  getProject,
  getProjects,
  getSlugs,
} from "@/lib/content";
import { formatYearRange } from "@/lib/dates";
import {
  alternates,
  articleJsonLd,
  openGraph,
  serializeJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return getSlugs("projects").map((slug) => ({ slug }));
}

// Every case study is prerendered. Any other slug renders the localized 404
// here rather than through `dynamicParams = false`, whose fall-through makes
// the standalone server log an internal error for every unknown URL.
async function resolveSlug(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  if (!getSlugs("projects").includes(slug)) notFound();
  return slug;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const slug = await resolveSlug(params);
  const project = await getProject(slug, locale);
  const seo = {
    title: `${project.title} — ${dict.meta.siteName}`,
    description: project.summary,
    path: `/projects/${slug}`,
  };
  return {
    title: project.title,
    description: project.summary,
    alternates: alternates(locale, seo.path),
    openGraph: openGraph(locale, seo, "article"),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

/** A case study: the problem, the decisions and their trade-offs, in MDX. */
export default async function CaseStudyPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { locale, dict } = await getI18n();
  const slug = await resolveSlug(params);
  const [project, projects, notes, body] = await Promise.all([
    getProject(slug, locale),
    getProjects(locale),
    getNotes(locale),
    getBody("projects", slug, locale),
  ]);
  const t = dict.caseStudy;
  const related = notes.filter((note) => note.projects.includes(slug));
  const next =
    projects[
      (projects.findIndex((p) => p.slug === slug) + 1) % projects.length
    ];
  const jsonLd = articleJsonLd(
    locale,
    {
      title: project.title,
      description: project.summary,
      path: `/projects/${slug}`,
    },
    dict.meta.siteName,
  );
  const { Content } = body;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ArticleHeader
        back={{ href: `/${locale}#work`, label: t.back }}
        breadcrumbLabel={dict.article.breadcrumb}
        path={`projects/${slug}`}
        eyebrow={
          <>
            <span className="text-accent-text">{t.eyebrow}</span>
            <EyebrowRule />
            <span>{dict.work.relation[project.relation]}</span>
            <EyebrowRule />
            <span>
              {dict.article.readingTime.replace(
                "{minutes}",
                String(body.minutes),
              )}
            </span>
          </>
        }
        title={project.title}
        lede={project.tagline}
      >
        <dl className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:mt-16">
          <div className="bg-surface p-5">
            <dt className="label-mono text-fg-subtle">{dict.work.role}</dt>
            <dd className="mt-2 text-fg">{project.role}</dd>
          </div>
          <div className="bg-surface p-5">
            <dt className="label-mono text-fg-subtle">{t.period}</dt>
            <dd className="mt-2 font-mono text-fg">
              {formatYearRange(
                project.period.start,
                project.period.end,
                dict.common.present,
              )}
            </dd>
          </div>
          <div
            className={cn("bg-surface p-5", !project.live && "sm:col-span-2")}
          >
            <dt className="label-mono text-fg-subtle">{dict.work.stack}</dt>
            <dd className="mt-2">
              <StackLine items={project.stack} className="text-sm text-fg" />
            </dd>
          </div>
          {project.live ? (
            <div className="bg-surface p-5">
              <dt className="label-mono text-fg-subtle">{t.live}</dt>
              <dd className="mt-2">
                <TextLink
                  href={project.live.href}
                  className="inline-flex items-center gap-1 font-mono"
                >
                  {new URL(project.live.href).host}
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </TextLink>
                <p className="mt-2 text-sm text-fg-muted">
                  {project.live.note}
                </p>
              </dd>
            </div>
          ) : null}
        </dl>
        <PendingList values={project.unconfirmed} className="mt-6" />
      </ArticleHeader>

      <ArticleBody headings={body.headings} tocLabel={dict.article.onThisPage}>
        <Content />
      </ArticleBody>

      <div className="border-t border-line py-section">
        <Container>
          {related.length > 0 ? (
            <section aria-labelledby="related-title" className="mb-16 lg:mb-20">
              <h2 id="related-title" className="mb-6 label-mono text-fg">
                {t.relatedNotes}
              </h2>
              <NoteList notes={related} />
            </section>
          ) : null}
          {next && next.slug !== slug ? (
            <NextLink
              label={t.next}
              href={next.href}
              title={next.title}
              summary={next.tagline}
            />
          ) : null}
        </Container>
      </div>
    </article>
  );
}

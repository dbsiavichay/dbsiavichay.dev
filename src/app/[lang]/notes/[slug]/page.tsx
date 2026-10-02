import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article/article-body";
import {
  ArticleHeader,
  EyebrowRule,
} from "@/components/article/article-header";
import { NextLink } from "@/components/article/next-link";
import { Badge } from "@/components/ui/badge";
import { Card, cardLinkClass } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PendingList } from "@/components/ui/pending";
import { TextLink } from "@/components/ui/text-link";
import { getI18n } from "@/i18n/server";
import {
  getBody,
  getNote,
  getNotes,
  getProject,
  getSlugs,
} from "@/lib/content";
import {
  alternates,
  articleJsonLd,
  openGraph,
  serializeJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  return getSlugs("notes").map((slug) => ({ slug }));
}

// Every note is prerendered. Any other slug renders the localized 404
// here rather than through `dynamicParams = false`, whose fall-through makes
// the standalone server log an internal error for every unknown URL.
async function resolveSlug(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  if (!getSlugs("notes").includes(slug)) notFound();
  return slug;
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/notes/[slug]">): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const slug = await resolveSlug(params);
  const note = await getNote(slug, locale);
  const seo = {
    title: `${note.title} — ${dict.meta.siteName}`,
    description: note.summary,
    path: `/notes/${slug}`,
  };
  return {
    title: note.title,
    description: note.summary,
    alternates: alternates(locale, seo.path),
    openGraph: openGraph(locale, seo, "article"),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

/** An engineering note: one technical story and its thesis, in MDX. */
export default async function NotePage({
  params,
}: PageProps<"/[lang]/notes/[slug]">) {
  const { locale, dict } = await getI18n();
  const slug = await resolveSlug(params);
  const [note, notes, body] = await Promise.all([
    getNote(slug, locale),
    getNotes(locale),
    getBody("notes", slug, locale),
  ]);
  const sources = await Promise.all(
    note.projects.map((project) => getProject(project, locale)),
  );
  const t = dict.note;
  const position = notes.findIndex((n) => n.slug === slug);
  const next = notes[(position + 1) % notes.length];
  const jsonLd = articleJsonLd(
    locale,
    { title: note.title, description: note.summary, path: `/notes/${slug}` },
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
        back={{ href: `/${locale}#notes`, label: t.back }}
        breadcrumbLabel={dict.article.breadcrumb}
        eyebrow={
          <>
            <span className="text-accent-text">
              {t.eyebrow} · {String(position + 1).padStart(2, "0")}
            </span>
            <EyebrowRule />
            <span>
              {dict.article.readingTime.replace(
                "{minutes}",
                String(body.minutes),
              )}
            </span>
          </>
        }
        title={note.title}
        lede={note.summary}
      >
        <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="label-mono text-fg-subtle">{dict.notes.from}</span>
          {sources.map((project) => (
            <TextLink
              key={project.slug}
              href={project.href}
              className="text-sm"
            >
              {project.name}
            </TextLink>
          ))}
        </p>
        <PendingList values={note.unconfirmed} className="mt-6" />
      </ArticleHeader>

      <ArticleBody headings={body.headings} tocLabel={dict.article.onThisPage}>
        <Content />
      </ArticleBody>

      <div className="border-t border-line py-section">
        <Container>
          <section aria-labelledby="sources-title" className="mb-16 lg:mb-20">
            <h2 id="sources-title" className="mb-6 label-mono text-fg">
              {t.caseStudies}
            </h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {sources.map((project) => (
                <li key={project.slug}>
                  <Card interactive className="group h-full">
                    <Badge variant="accent">
                      {dict.work.relation[project.relation]}
                    </Badge>
                    <h3 className="mt-4 text-lg font-semibold text-balance text-fg">
                      <Link
                        href={project.href}
                        className={`${cardLinkClass} transition-colors group-hover:text-accent-text`}
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-fg-muted">
                      {project.tagline}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          {next && next.slug !== slug ? (
            <NextLink
              label={t.next}
              href={next.href}
              title={next.title}
              summary={next.summary}
            />
          ) : null}
        </Container>
      </div>
    </article>
  );
}

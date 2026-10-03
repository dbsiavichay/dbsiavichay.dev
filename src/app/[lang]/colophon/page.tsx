import type { Metadata } from "next";

import { ArticleBody } from "@/components/article/article-body";
import {
  ArticleHeader,
  EyebrowRule,
} from "@/components/article/article-header";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { profile } from "@/data/profile";
import { getI18n } from "@/i18n/server";
import { contentPath, getBody, getPage } from "@/lib/content";
import {
  alternates,
  articleJsonLd,
  openGraph,
  serializeJsonLd,
} from "@/lib/seo";

const slug = "colophon";
const path = contentPath("pages", slug);

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const page = await getPage(slug, locale);
  const seo = {
    title: `${page.title} — ${dict.meta.siteName}`,
    description: page.summary,
    path,
  };
  return {
    title: page.title,
    description: page.summary,
    alternates: alternates(locale, path),
    openGraph: openGraph(locale, seo, "article"),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

/** How this site is built, tested and deployed, in MDX. */
export default async function ColophonPage() {
  const { locale, dict } = await getI18n();
  const [page, body] = await Promise.all([
    getPage(slug, locale),
    getBody("pages", slug, locale),
  ]);
  const t = dict.colophon;
  const jsonLd = articleJsonLd(
    locale,
    { title: page.title, description: page.summary, path },
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
        back={{ href: `/${locale}`, label: t.back }}
        breadcrumbLabel={dict.article.breadcrumb}
        path="colophon"
        eyebrow={
          <>
            <span className="text-accent-text">{t.eyebrow}</span>
            <EyebrowRule />
            <span>
              {dict.article.readingTime.replace(
                "{minutes}",
                String(body.minutes),
              )}
            </span>
          </>
        }
        title={page.title}
        lede={page.summary}
      />

      <ArticleBody headings={body.headings} tocLabel={dict.article.onThisPage}>
        <Content />
      </ArticleBody>

      <div className="border-t border-line py-section">
        <Container>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="label-mono text-fg-subtle">
              {dict.status.source}
            </span>
            <TextLink
              href={profile.repository}
              className="font-mono text-sm [overflow-wrap:anywhere]"
            >
              {profile.repository.replace(/^https:\/\//, "")}
            </TextLink>
          </p>
        </Container>
      </div>
    </article>
  );
}

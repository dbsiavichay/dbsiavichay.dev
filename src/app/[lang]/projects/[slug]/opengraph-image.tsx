import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProject, getSlugs } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

// Language-neutral: "case study" reads the same on both sides of the site.
export const alt = "Case study — Denis Siavichay, Software Engineer";
export const size = ogSize;
export const contentType = ogContentType;

// Every image is rendered at build time; an unknown slug is a 404, not a render.
export const dynamicParams = false;

// Image routes don't inherit the layout's params: list every language here.
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getSlugs("projects").map((slug) => ({ lang, slug })),
  );
}

/** The card shown when a case study is shared. Rendered at build time. */
export default async function OpengraphImage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !getSlugs("projects").includes(slug)) notFound();
  const dict = getDictionary(lang);
  const project = await getProject(slug, lang);
  return renderOgImage({
    eyebrow: `${dict.caseStudy.eyebrow} · ${dict.meta.siteName}`,
    title: project.title,
    subtitle: project.tagline,
  });
}

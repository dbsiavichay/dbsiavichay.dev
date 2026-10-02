import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getNote, getSlugs } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = "Engineering note — Denis Siavichay, Software Engineer";
export const size = ogSize;
export const contentType = ogContentType;

// Every image is rendered at build time; an unknown slug is a 404, not a render.
export const dynamicParams = false;

// Image routes don't inherit the layout's params: list every language here.
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getSlugs("notes").map((slug) => ({ lang, slug })),
  );
}

/** The card shown when a note is shared. Rendered at build time. */
export default async function OpengraphImage({
  params,
}: PageProps<"/[lang]/notes/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !getSlugs("notes").includes(slug)) notFound();
  const dict = getDictionary(lang);
  const note = await getNote(slug, lang);
  return renderOgImage({
    eyebrow: `${dict.note.eyebrow} · ${dict.meta.siteName}`,
    title: note.title,
  });
}

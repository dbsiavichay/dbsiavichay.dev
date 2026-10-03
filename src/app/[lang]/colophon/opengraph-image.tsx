import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPage } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

// Language-neutral: the page is the same in both languages.
export const alt = "Colophon — Denis Siavichay, Software Engineer";
export const size = ogSize;
export const contentType = ogContentType;

// Image routes don't inherit the layout's params: list every language here.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** The card shown when the colophon is shared. Rendered at build time. */
export default async function OpengraphImage({
  params,
}: PageProps<"/[lang]/colophon">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const page = await getPage("colophon", lang);
  return renderOgImage({
    eyebrow: `${dict.colophon.eyebrow} · ${dict.meta.siteName}`,
    title: page.title,
    subtitle: dict.colophon.subtitle,
  });
}

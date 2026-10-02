import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

// Language-neutral on purpose: the name and the job title read the same in both.
export const alt = "Denis Siavichay — Software Engineer";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** The card shown when the home page is shared. Rendered at build time. */
export default async function OpengraphImage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return renderOgImage({ eyebrow: dict.hero.eyebrow, title: dict.hero.title });
}

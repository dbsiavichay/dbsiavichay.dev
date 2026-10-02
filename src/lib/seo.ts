import type { Metadata } from "next";

import { education } from "@/data/experience";
import { profile } from "@/data/profile";
import { localeTags, locales, type Locale } from "@/i18n/config";

import { env } from "./env";

/** Open Graph wants `language_TERRITORY`. */
export const ogLocales: Record<Locale, string> = { en: "en_US", es: "es_EC" };

/** `path` is the route inside a locale: "" for the home, "/projects/x"… */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

export function absoluteUrl(path: string, origin: string = env.SITE_URL) {
  return `${origin}${path}`;
}

/**
 * Canonical and `hreflang` links for a route that exists in every locale.
 * `x-default` is the unprefixed path: the proxy sends it to the visitor's
 * language, which is what x-default is for.
 */
export function alternates(
  locale: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(
        locales.map((l) => [localeTags[l], localePath(l, path)]),
      ),
      "x-default": path || "/",
    },
  };
}

type PageSeo = { title: string; description: string; path?: string };

export function openGraph(
  locale: Locale,
  { title, description, path = "" }: PageSeo,
  type: "website" | "article" = "website",
): NonNullable<Metadata["openGraph"]> {
  return {
    type,
    ...(type === "article" ? { authors: [profile.name] } : {}),
    siteName: profile.name,
    title,
    description,
    url: localePath(locale, path),
    locale: ogLocales[locale],
    alternateLocale: locales
      .filter((l) => l !== locale)
      .map((l) => ogLocales[l]),
  };
}

/**
 * Structured data for the home page: who the site is about, the site itself,
 * and the page that describes him.
 */
export function profileJsonLd(locale: Locale, { title, description }: PageSeo) {
  const origin = env.SITE_URL;
  const person = `${origin}/#person`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": person,
        name: profile.name,
        jobTitle: profile.jobTitle,
        url: origin,
        sameAs: [profile.links.github, profile.links.linkedin],
        address: {
          "@type": "PostalAddress",
          addressCountry: profile.countryCode,
        },
        alumniOf: education.map((entry) => ({
          "@type": "CollegeOrUniversity",
          name: entry.institution[locale],
        })),
        knowsLanguage: ["es", "en"],
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: profile.name,
        inLanguage: locales.map((l) => localeTags[l]),
        author: { "@id": person },
      },
      {
        "@type": "ProfilePage",
        url: absoluteUrl(localePath(locale)),
        name: title,
        description,
        inLanguage: localeTags[locale],
        isPartOf: { "@id": `${origin}/#website` },
        mainEntity: { "@id": person },
      },
    ],
  };
}

/**
 * Structured data for a case study or a note: the article, written by the
 * person the home page describes, and where it sits in the site.
 */
export function articleJsonLd(
  locale: Locale,
  { title, description, path = "" }: PageSeo,
  homeName: string,
) {
  const origin = env.SITE_URL;
  const url = absoluteUrl(localePath(locale, path));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: title,
        description,
        url,
        inLanguage: localeTags[locale],
        author: {
          "@type": "Person",
          "@id": `${origin}/#person`,
          name: profile.name,
          url: origin,
        },
        isPartOf: { "@id": `${origin}/#website` },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: homeName, item: absoluteUrl(localePath(locale)) },
          { name: title, item: url },
        ].map((entry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          ...entry,
        })),
      },
    ],
  };
}

/** JSON for a `<script type="application/ld+json">`, safe to inline in HTML. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

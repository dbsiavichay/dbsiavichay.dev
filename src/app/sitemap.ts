import type { MetadataRoute } from "next";

import { localeTags, locales } from "@/i18n/config";
import { contentKinds, getSlugs } from "@/lib/content";
import { env } from "@/lib/env";
import { absoluteUrl, localePath } from "@/lib/seo";

/** Routes inside each locale: the home, every case study and every note. */
function routes(): string[] {
  return [
    "",
    ...contentKinds.flatMap((kind) =>
      getSlugs(kind).map((slug) => `/${kind}/${slug}`),
    ),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes().flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      ...(env.BUILD_TIME ? { lastModified: env.BUILD_TIME } : {}),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [localeTags[l], absoluteUrl(localePath(l, path))]),
        ),
      },
    })),
  );
}

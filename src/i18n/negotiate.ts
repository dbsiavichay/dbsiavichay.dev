import { defaultLocale, isLocale, locales, type Locale } from "./config";

/**
 * Picks the locale for a request that arrived without one in its path.
 *
 * An explicit choice (the cookie written by the language switcher) wins over
 * the browser's `Accept-Language`, which wins over the default. Only the
 * primary subtag matters: `es-EC`, `es-MX` and `es` all resolve to `es`.
 */
export function negotiateLocale(
  acceptLanguage: string | null,
  cookieLocale?: string,
): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return {
        primary: tag.trim().toLowerCase().split("-")[0] ?? "",
        q: Number.isFinite(q) ? q : 0,
        index,
      };
    })
    .filter((entry) => entry.primary !== "" && entry.q > 0)
    // Highest quality first; ties keep the order the browser sent them in.
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { primary } of ranked) {
    if (primary === "*") return defaultLocale;
    if ((locales as readonly string[]).includes(primary))
      return primary as Locale;
  }

  return defaultLocale;
}

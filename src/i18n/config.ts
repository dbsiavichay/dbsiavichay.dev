export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that remembers an explicit language choice made with the switcher. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

/** Human-readable names, written in their own language. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/** BCP 47 tags for `<html lang>`, Open Graph and `hreflang`. */
export const localeTags: Record<Locale, string> = {
  en: "en",
  es: "es",
};

import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { isLocale, type Locale } from "./config";
import { getDictionary } from "./get-dictionary";

/**
 * The locale of the current route, read from the `[lang]` root segment so
 * Server Components don't need it passed down as a prop.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}

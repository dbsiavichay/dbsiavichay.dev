import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export type NavItem = { href: string; label: string };

/** Section anchors on the home page, in page order. */
export const navSections = [
  "work",
  "notes",
  "experience",
  "about",
  "contact",
] as const;

export function getNavItems(locale: Locale, dict: Dictionary): NavItem[] {
  return navSections.map((id) => ({
    href: `/${locale}#${id}`,
    label: dict.nav[id],
  }));
}

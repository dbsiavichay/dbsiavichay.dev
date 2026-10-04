"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeNames, locales, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/paths";
import { rememberLocale } from "@/i18n/remember-locale";

type LocaleSwitchProps = {
  current: Locale;
  label: string;
};

export function LocaleSwitch({ current, label }: LocaleSwitchProps) {
  const pathname = usePathname() ?? `/${current}`;

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center font-mono text-xs"
    >
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 ? (
            <span aria-hidden="true" className="px-1 text-fg-subtle">
              /
            </span>
          ) : null}
          {locale === current ? (
            <span aria-current="true" className="px-1.5 py-2 text-fg uppercase">
              <span className="sr-only">{localeNames[locale]}</span>
              <span aria-hidden="true">{locale}</span>
            </span>
          ) : (
            <Link
              href={localizedPath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              onClick={() => rememberLocale(locale)}
              className="rounded-sm px-1.5 py-2 text-fg-subtle uppercase transition-colors hover:text-fg"
            >
              <span className="sr-only">{localeNames[locale]}</span>
              <span aria-hidden="true">{locale}</span>
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * The path of the page, as a shell would echo it, for the 404: it can't
 * receive the URL it answers, and it renders on request, so the server
 * already writes the right path. It lives here because the 404 is part of
 * every page's layout: a client module of its own would be one more request
 * on every page, and this one already loads with the header.
 */
export function CurrentPath() {
  return usePathname();
}

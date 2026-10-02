import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE, locales } from "@/i18n/config";
import { negotiateLocale } from "@/i18n/negotiate";

/**
 * Every page lives under `/en` or `/es`. A path without a locale is redirected
 * to the visitor's language; everything else passes straight through.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = negotiateLocale(
    request.headers.get("accept-language"),
    request.cookies.get(LOCALE_COOKIE)?.value,
  );

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  // The answer depends on these headers, so caches must not share it.
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, metadata files, the health check and anything with
    // a file extension (fonts, images, robots.txt, sitemap.xml…).
    "/((?!_next/|healthz|.*\\..*).*)",
  ],
};

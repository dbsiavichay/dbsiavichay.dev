import { LOCALE_COOKIE, type Locale } from "./config";

/**
 * Remembers an explicit language choice. The proxy reads the cookie on the
 * next visit to "/", so the choice sticks. Browser only.
 */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

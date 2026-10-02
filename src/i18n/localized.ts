import type { Locale } from "./config";

/**
 * A value written once per language. Structured content in `src/data` uses it
 * for its text, so a missing translation is a type error.
 */
export type Localized<T = string> = Record<Locale, T>;

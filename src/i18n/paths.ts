import type { Locale } from "./config";

/** The same path in another language: swaps the leading locale segment. */
export function localizedPath(pathname: string, target: Locale): string {
  const [, , ...rest] = pathname.split("/");
  const tail = rest.join("/");
  return tail ? `/${target}/${tail}` : `/${target}`;
}

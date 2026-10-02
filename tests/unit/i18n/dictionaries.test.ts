import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/** Every leaf path of a nested object, e.g. "nav.work". */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): unknown[] {
  if (typeof value !== "object" || value === null) return [value];
  return Object.values(value).flatMap(leafValues);
}

describe("dictionaries", () => {
  const reference = leafPaths(getDictionary("en")).sort();

  it.each(locales)(
    "%s has exactly the keys of the English dictionary",
    (locale) => {
      expect(leafPaths(getDictionary(locale)).sort()).toEqual(reference);
    },
  );

  it.each(locales)("%s has no empty strings", (locale) => {
    for (const value of leafValues(getDictionary(locale))) {
      expect(typeof value).toBe("string");
      expect((value as string).trim()).not.toBe("");
    }
  });
});

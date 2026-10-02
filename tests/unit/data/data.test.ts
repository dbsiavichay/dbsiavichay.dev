import { describe, expect, it } from "vitest";

import { capabilities } from "@/data/capabilities";
import type { Evidence } from "@/data/evidence";
import { education, experience } from "@/data/experience";
import { openSource } from "@/data/open-source";
import { processSteps } from "@/data/process";
import { profile } from "@/data/profile";
import { stack } from "@/data/stack";
import { locales } from "@/i18n/config";
import { getSlugs } from "@/lib/content";
import { isPending, type Pending } from "@/lib/pending";

const projectSlugs = getSlugs("projects");
const experienceIds = experience.map((entry) => entry.id);

const allEvidence: Evidence[] = [
  ...capabilities.flatMap((c) => c.evidence),
  ...processSteps.map((s) => s.evidence),
  ...experience.flatMap((e) => e.evidence),
  ...stack.flatMap((g) => g.items.flatMap((i) => i.usedIn)),
];

/** Every `{ en, es }` object in a value, wherever it is nested. */
function localizedValues(value: unknown): Record<string, unknown>[] {
  if (typeof value !== "object" || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(localizedValues);
  const keys = Object.keys(value).sort();
  if (keys.join() === [...locales].sort().join()) {
    return [value as Record<string, unknown>];
  }
  return Object.values(value).flatMap(localizedValues);
}

const sortable = (date: string) => date.padEnd(7, "-00");

describe("evidence", () => {
  it.each(allEvidence.map((e) => [JSON.stringify(e), e] as const))(
    "%s points to something that exists",
    (_, evidence) => {
      if (evidence.kind === "project") {
        expect(projectSlugs).toContain(evidence.slug);
      }
      if (evidence.kind === "experience") {
        expect(experienceIds).toContain(evidence.id);
        const entry = experience.find((e) => e.id === evidence.id);
        // Pending entries are hidden in production, so nothing may cite them.
        expect(isPending(entry?.organization)).toBe(false);
      }
    },
  );

  it("backs every capability and step with at least one source", () => {
    for (const capability of capabilities) {
      expect(capability.evidence.length).toBeGreaterThan(0);
    }
    for (const item of stack.flatMap((group) => group.items)) {
      expect(item.usedIn.length, item.name).toBeGreaterThan(0);
    }
  });
});

describe("experience", () => {
  it("uses unique ids", () => {
    expect(new Set(experienceIds).size).toBe(experienceIds.length);
  });

  it("writes dates as YYYY or YYYY-MM", () => {
    for (const { period } of [...experience, ...education]) {
      for (const edge of [period.start, period.end]) {
        if (isPending(edge) || edge === "present") continue;
        expect(edge).toMatch(/^\d{4}(-(0[1-9]|1[0-2]))?$/);
      }
    }
  });

  it("is listed newest first", () => {
    const starts = experience
      .map((entry): string | Pending => entry.period.start)
      .filter((start): start is string => !isPending(start))
      .map(sortable);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it("never ends a period before it starts", () => {
    for (const { period } of [...experience, ...education]) {
      const { start, end } = period;
      if (isPending(start) || isPending(end) || end === "present") continue;
      expect(sortable(end) >= sortable(start)).toBe(true);
    }
  });

  it("has the same number of highlights in every language", () => {
    for (const entry of experience) {
      const counts = locales.map((l) => entry.highlights[l].length);
      expect(new Set(counts).size, entry.id).toBe(1);
    }
  });
});

describe("open source", () => {
  it("lists releases in order and links to PyPI", () => {
    for (const pkg of openSource) {
      expect(pkg.releases.last).toBeGreaterThanOrEqual(pkg.releases.first);
      expect(pkg.pypi).toBe(`https://pypi.org/project/${pkg.name}/`);
    }
  });
});

describe("localized text", () => {
  const sources = {
    capabilities,
    processSteps,
    experience,
    education,
    stack,
    openSource,
    profile,
  };

  it.each(Object.entries(sources))(
    "%s is written in every language",
    (_, source) => {
      const values = localizedValues(source);
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) {
        for (const locale of locales) {
          const text = value[locale];
          const items = Array.isArray(text) ? text : [text];
          for (const item of items) {
            expect(typeof item).toBe("string");
            expect((item as string).trim()).not.toBe("");
          }
        }
      }
    },
  );
});

import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/config";
import {
  contentKinds,
  getNotes,
  getProjects,
  getSlugs,
  type Note,
  type Project,
} from "@/lib/content";

const root = path.join(process.cwd(), "src", "content");

describe.each(contentKinds)("content/%s", (kind) => {
  const slugs = getSlugs(kind);

  it("has entries", () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  it.each(slugs)("%s is written in every language, and only those", (slug) => {
    const files = readdirSync(path.join(root, kind, slug)).sort();
    expect(files).toEqual(locales.map((locale) => `${locale}.mdx`).sort());
  });

  it("uses URL-safe slugs", () => {
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

/** The fields that state facts rather than prose: they can't differ by language. */
function projectFacts(project: Project) {
  const { relation, period, stack, live, tier, order, slug } = project;
  return { relation, period, stack, live: live?.href, tier, order, slug };
}

function noteFacts(note: Note) {
  const { projects, order, slug } = note;
  return { projects, order, slug };
}

describe("project meta", async () => {
  const byLocale = await Promise.all(locales.map((l) => getProjects(l)));
  const [reference = [], ...others] = byLocale;

  it("is valid in every language", () => {
    for (const projects of byLocale) {
      expect(projects.length).toBe(getSlugs("projects").length);
    }
  });

  it("states the same facts in every language", () => {
    for (const projects of others) {
      expect(projects.map(projectFacts)).toEqual(reference.map(projectFacts));
    }
  });

  it("has the same number of highlights in every language", () => {
    for (const projects of others) {
      expect(projects.map((p) => p.highlights.length)).toEqual(
        reference.map((p) => p.highlights.length),
      );
    }
  });

  it("has exactly one featured project and a unique order", () => {
    expect(reference.filter((p) => p.tier === "featured")).toHaveLength(1);
    const orders = reference.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe("note meta", async () => {
  const byLocale = await Promise.all(locales.map((l) => getNotes(l)));
  const [reference = [], ...others] = byLocale;
  const projectSlugs = getSlugs("projects");

  it("states the same facts in every language", () => {
    for (const notes of others) {
      expect(notes.map(noteFacts)).toEqual(reference.map(noteFacts));
    }
  });

  it("only cites projects that exist", () => {
    for (const note of reference) {
      for (const slug of note.projects) expect(projectSlugs).toContain(slug);
    }
  });

  it("links to the note's page in its own language", () => {
    byLocale.forEach((notes, i) => {
      for (const note of notes) {
        expect(note.href).toBe(`/${locales[i]}/notes/${note.slug}`);
      }
    });
  });
});

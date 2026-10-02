import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { MDXContent } from "mdx/types";
import { z } from "zod";

import type { Locale } from "@/i18n/config";

import { extractHeadings, readingMinutes, type Heading } from "./mdx-source";
import {
  noteMetaSchema,
  projectMetaSchema,
  type NoteMeta,
  type ProjectMeta,
} from "./schemas";

/**
 * Long-form content lives in `src/content/<kind>/<slug>/<locale>.mdx`. Each
 * folder is an entry and its name is the slug, so adding a project is adding
 * a folder. Pages are prerendered, so this only runs during the build.
 */
export const contentKinds = ["projects", "notes"] as const;

export type ContentKind = (typeof contentKinds)[number];

const contentRoot = path.join(process.cwd(), "src", "content");

export function getSlugs(kind: ContentKind): string[] {
  return readdirSync(path.join(contentRoot, kind), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

type MdxModule = { default: MDXContent; meta?: unknown };

// One literal import per kind, so the bundler knows which files to include.
const importers: Record<
  ContentKind,
  (slug: string, locale: Locale) => Promise<MdxModule>
> = {
  projects: (slug, locale) =>
    import(`@/content/projects/${slug}/${locale}.mdx`),
  notes: (slug, locale) => import(`@/content/notes/${slug}/${locale}.mdx`),
};

async function loadMeta<S extends z.ZodType>(
  kind: ContentKind,
  schema: S,
  slug: string,
  locale: Locale,
): Promise<z.output<S>> {
  const mod = await importers[kind](slug, locale);
  const result = schema.safeParse(mod.meta);
  if (!result.success) {
    throw new Error(
      `Invalid meta in src/content/${kind}/${slug}/${locale}.mdx\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export type Project = ProjectMeta & {
  slug: string;
  href: string;
  /** `shortTitle`, or the title when there is none. */
  name: string;
};

export type Note = NoteMeta & { slug: string; href: string };

export function projectHref(locale: Locale, slug: string) {
  return `/${locale}/projects/${slug}`;
}

export function noteHref(locale: Locale, slug: string) {
  return `/${locale}/notes/${slug}`;
}

export async function getProject(
  slug: string,
  locale: Locale,
): Promise<Project> {
  const meta = await loadMeta("projects", projectMetaSchema, slug, locale);
  return {
    ...meta,
    slug,
    href: projectHref(locale, slug),
    name: meta.shortTitle ?? meta.title,
  };
}

export async function getNote(slug: string, locale: Locale): Promise<Note> {
  const meta = await loadMeta("notes", noteMetaSchema, slug, locale);
  return { ...meta, slug, href: noteHref(locale, slug) };
}

const byOrder = (a: { order: number }, b: { order: number }) =>
  a.order - b.order;

/** The rendered body of an entry, with what the page shows around it. */
export type Body = {
  Content: MDXContent;
  headings: Heading[];
  /** Estimated reading time, in whole minutes. */
  minutes: number;
};

export async function getBody(
  kind: ContentKind,
  slug: string,
  locale: Locale,
): Promise<Body> {
  const [mod, source] = await Promise.all([
    importers[kind](slug, locale),
    readFile(path.join(contentRoot, kind, slug, `${locale}.mdx`), "utf8"),
  ]);
  return {
    Content: mod.default,
    headings: extractHeadings(source),
    minutes: readingMinutes(source),
  };
}

export async function getProjects(locale: Locale): Promise<Project[]> {
  const projects = await Promise.all(
    getSlugs("projects").map((slug) => getProject(slug, locale)),
  );
  return projects.sort(byOrder);
}

export async function getNotes(locale: Locale): Promise<Note[]> {
  const notes = await Promise.all(
    getSlugs("notes").map((slug) => getNote(slug, locale)),
  );
  return notes.sort(byOrder);
}

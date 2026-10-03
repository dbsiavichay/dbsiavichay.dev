import { z } from "zod";

import { isPending, type Pending } from "./pending";

const pendingSchema = z.custom<Pending>(isPending, "expected a Pending value");

const text = z.string().trim().min(1);
const year = z.number().int().min(2000).max(2100);

export const periodSchema = z
  .object({
    start: year,
    end: z.union([year, z.literal("present")]),
  })
  .refine(({ start, end }) => end === "present" || end >= start, {
    message: "a period cannot end before it starts",
  });

export type Period = z.infer<typeof periodSchema>;

/** How Denis relates to a project: built for a client, his own, or as an employee. */
export const projectRelations = ["client", "own-product", "in-house"] as const;

export type ProjectRelation = (typeof projectRelations)[number];

/** Size of the card on the home page. */
export const projectTiers = ["featured", "standard", "compact"] as const;

/**
 * `export const meta` of `src/content/projects/<slug>/<locale>.mdx`.
 *
 * Text fields are written per language; `relation`, `period`, `stack`,
 * `live.href`, `tier` and `order` are facts and must match across languages
 * (tested).
 */
export const projectMetaSchema = z
  .object({
    title: text,
    /** Name used where the project is referenced; defaults to the title. */
    shortTitle: text.optional(),
    /** One line under the title. */
    tagline: text,
    /** One or two sentences for cards and the page description. */
    summary: text,
    relation: z.enum(projectRelations),
    /** What Denis did on the project. */
    role: text,
    period: periodSchema,
    stack: z.array(text).min(1),
    highlights: z.array(text).max(4).default([]),
    /** Where the system runs, when it may be linked. */
    live: z
      .object({
        href: z.url({ protocol: /^https$/ }),
        /** What a visitor finds there, in a few words. */
        note: text,
      })
      .strict()
      .optional(),
    tier: z.enum(projectTiers),
    order: z.number().int(),
    /** Facts about the project still waiting for confirmation. */
    unconfirmed: z.array(pendingSchema).default([]),
  })
  .strict();

export type ProjectMeta = z.infer<typeof projectMetaSchema>;

/**
 * `export const meta` of `src/content/notes/<slug>/<locale>.mdx`.
 * `projects` and `order` are facts and must match across languages.
 */
export const noteMetaSchema = z
  .object({
    title: text,
    /** The note's thesis, in a sentence or two. */
    summary: text,
    /** Slugs of the projects the note comes from. */
    projects: z.array(text).min(1),
    order: z.number().int(),
    unconfirmed: z.array(pendingSchema).default([]),
  })
  .strict();

export type NoteMeta = z.infer<typeof noteMetaSchema>;

/** `export const meta` of `src/content/pages/<slug>/<locale>.mdx`. */
export const pageMetaSchema = z
  .object({
    title: text,
    /** What the page is about, in a sentence or two. */
    summary: text,
  })
  .strict();

export type PageMeta = z.infer<typeof pageMetaSchema>;

import type { ExperienceId } from "./experience";

/**
 * What backs a claim: a project with a case study, a job in the experience
 * timeline, or this site itself. Project slugs are checked against
 * `src/content/projects` by the tests.
 */
export type Evidence =
  | { kind: "project"; slug: string }
  | { kind: "experience"; id: ExperienceId }
  | { kind: "site" };

export const project = (slug: string): Evidence => ({ kind: "project", slug });

export const job = (id: ExperienceId): Evidence => ({ kind: "experience", id });

export const thisSite: Evidence = { kind: "site" };

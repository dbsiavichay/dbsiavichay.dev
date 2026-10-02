import type { Evidence } from "@/data/evidence";
import { experience } from "@/data/experience";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/lib/content";
import { isPending } from "@/lib/pending";

export type EvidenceContext = {
  locale: Locale;
  projects: ReadonlyMap<string, Project>;
  /** Label for `{ kind: "site" }`. */
  thisSite: string;
};

export type EvidenceLink = { key: string; label: string; href?: string };

/** Turns a reference into the label and link a reader sees. */
export function resolveEvidence(
  evidence: Evidence,
  { locale, projects, thisSite }: EvidenceContext,
): EvidenceLink {
  switch (evidence.kind) {
    case "project": {
      const project = projects.get(evidence.slug);
      if (!project) throw new Error(`Unknown project "${evidence.slug}"`);
      return {
        key: `project:${project.slug}`,
        label: project.name,
        href: project.href,
      };
    }
    case "experience": {
      const entry = experience.find((item) => item.id === evidence.id);
      if (!entry || isPending(entry.organization)) {
        throw new Error(`Experience "${evidence.id}" has no confirmed name`);
      }
      return {
        key: `experience:${entry.id}`,
        label: entry.organization[locale],
        href: `/${locale}#experience-${entry.id}`,
      };
    }
    case "site":
      return { key: "site", label: thisSite };
  }
}

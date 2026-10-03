import { describe, expect, it } from "vitest";

import {
  resolveEvidence,
  type EvidenceContext,
} from "@/components/home/evidence";
import { job, project, thisSite } from "@/data/evidence";
import type { ExperienceId } from "@/data/experience";
import { getProjects } from "@/lib/content";

describe("resolveEvidence", async () => {
  const projects = await getProjects("es");
  const context: EvidenceContext = {
    locale: "es",
    projects: new Map(projects.map((p) => [p.slug, p])),
    thisSite: "este sitio",
  };

  it("links a project to its case study by its short name", () => {
    expect(resolveEvidence(project("sim"), context)).toEqual({
      key: "project:sim",
      label: "SIM",
      href: "/es/projects/sim",
    });
  });

  it("links a job to its entry in the timeline", () => {
    expect(resolveEvidence(job("justo"), context)).toEqual({
      key: "experience:justo",
      label: "Jüsto",
      href: "/es#experience-justo",
    });
  });

  it("links this site to its colophon", () => {
    expect(resolveEvidence(thisSite, context)).toEqual({
      key: "site",
      label: "este sitio",
      href: "/es/colophon",
    });
  });

  it("refuses references to things that don't exist", () => {
    expect(() => resolveEvidence(project("nope"), context)).toThrow();
    expect(() =>
      resolveEvidence(job("nope" as ExperienceId), context),
    ).toThrow();
  });
});

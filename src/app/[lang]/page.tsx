import type { Metadata } from "next";

import { About } from "@/components/home/about";
import { Capabilities } from "@/components/home/capabilities";
import { Contact } from "@/components/home/contact";
import type { EvidenceContext } from "@/components/home/evidence";
import { Experience } from "@/components/home/experience";
import { FeaturedWork } from "@/components/home/featured-work";
import { Hero } from "@/components/home/hero";
import { Notes } from "@/components/home/notes";
import { Process } from "@/components/home/process";
import { Stack } from "@/components/home/stack";
import { getI18n } from "@/i18n/server";
import { getNotes, getProjects } from "@/lib/content";
import {
  alternates,
  openGraph,
  profileJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  const seo = { title: dict.meta.title, description: dict.meta.description };
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: alternates(locale),
    openGraph: openGraph(locale, seo),
    twitter: { card: "summary_large_image", ...seo },
  };
}

/**
 * The home page orders evidence before lists: what Denis builds and the work
 * that proves it come first, the stack comes late on purpose.
 */
export default async function HomePage() {
  const { locale, dict } = await getI18n();
  const [projects, notes] = await Promise.all([
    getProjects(locale),
    getNotes(locale),
  ]);
  const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));
  const evidence: EvidenceContext = {
    locale,
    projects: projectsBySlug,
    thisSite: dict.stack.thisSite,
  };
  const jsonLd = profileJsonLd(locale, {
    title: dict.meta.title,
    description: dict.meta.description,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Hero />
      <Capabilities evidence={evidence} />
      <FeaturedWork projects={projects} />
      <Notes notes={notes} projects={projectsBySlug} />
      <Process evidence={evidence} />
      <Experience evidence={evidence} />
      <Stack evidence={evidence} />
      <About />
      <Contact />
    </>
  );
}

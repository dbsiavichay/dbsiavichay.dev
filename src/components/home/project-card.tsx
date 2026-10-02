import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, cardLinkClass } from "@/components/ui/card";
import { PendingList } from "@/components/ui/pending";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Project } from "@/lib/content";
import { formatYearRange } from "@/lib/dates";
import { cn } from "@/lib/utils";

import { CutPlanSketch } from "./cut-plan-sketch";

type ProjectCardProps = {
  project: Project;
  dict: Dictionary;
  className?: string;
};

function Meta({ project, dict }: Omit<ProjectCardProps, "className">) {
  return (
    <p className="flex flex-wrap items-center gap-3">
      <Badge variant="accent">{dict.work.relation[project.relation]}</Badge>
      <span className="font-mono text-xs text-fg-subtle">
        {formatYearRange(
          project.period.start,
          project.period.end,
          dict.common.present,
        )}
      </span>
    </p>
  );
}

function Title({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <h3 className={cn("font-semibold text-balance text-fg", className)}>
      <Link href={project.href} className={cardLinkClass}>
        {project.title}
      </Link>
    </h3>
  );
}

function StackList({
  stack,
  limit,
  className,
}: {
  stack: string[];
  limit: number;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {stack.slice(0, limit).map((item) => (
        <li key={item}>
          <Badge>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}

function CaseStudyCue({ label }: { label: string }) {
  // The title link is the accessible name; this is only the visual cue.
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center gap-1 label-mono text-accent-text"
    >
      {label}
      <ArrowUpRight className="size-3.5" />
    </span>
  );
}

function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-6 space-y-2.5 text-sm text-fg-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The main case study: text beside a drawing of what the system produces. */
export function FeaturedProjectCard({
  project,
  dict,
  className,
}: ProjectCardProps) {
  return (
    <Card
      as="article"
      interactive
      className={cn(
        "grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12 lg:p-10",
        className,
      )}
    >
      <div className="flex flex-col">
        <Meta project={project} dict={dict} />
        <Title project={project} className="mt-6 text-3xl" />
        <p className="mt-3 text-lg text-fg">{project.tagline}</p>
        <p className="mt-4 text-fg-muted">{project.summary}</p>
        <Highlights items={project.highlights} />
        <dl className="mt-8 grid gap-1 text-sm">
          <dt className="label-mono text-fg-subtle">{dict.work.role}</dt>
          <dd className="text-fg-muted">{project.role}</dd>
        </dl>
        <PendingList values={project.unconfirmed} className="mt-6" />
      </div>
      <div className="flex flex-col justify-between gap-8">
        <CutPlanSketch
          caption={dict.work.illustration}
          labels={dict.work.illustrationLabels}
        />
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
          <StackList stack={project.stack} limit={8} />
          <CaseStudyCue label={dict.common.caseStudy} />
        </div>
      </div>
    </Card>
  );
}

export function ProjectCard({ project, dict, className }: ProjectCardProps) {
  return (
    <Card
      as="article"
      interactive
      className={cn("flex flex-col p-6 sm:p-8", className)}
    >
      <div className="grow">
        <Meta project={project} dict={dict} />
        <Title project={project} className="mt-6 text-2xl" />
        <p className="mt-2 text-fg">{project.tagline}</p>
        <p className="mt-4 text-fg-muted">{project.summary}</p>
        <Highlights items={project.highlights} />
        <PendingList values={project.unconfirmed} className="mt-6" />
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
        <StackList stack={project.stack} limit={5} />
        <CaseStudyCue label={dict.common.caseStudy} />
      </div>
    </Card>
  );
}

/** One row for a smaller project: what it is, what it did, where it lives. */
export function CompactProjectCard({
  project,
  dict,
  className,
}: ProjectCardProps) {
  return (
    <Card
      as="article"
      interactive
      className={cn(
        "grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_auto] lg:items-start lg:gap-10",
        className,
      )}
    >
      <div>
        <Meta project={project} dict={dict} />
        <Title project={project} className="mt-5 text-xl" />
        <p className="mt-2 text-sm text-fg">{project.tagline}</p>
      </div>
      <div>
        <p className="text-fg-muted">{project.summary}</p>
        <p className="mt-3 text-sm text-fg-subtle">{project.role}</p>
        <StackList stack={project.stack} limit={6} className="mt-4" />
        <PendingList values={project.unconfirmed} className="mt-4" />
      </div>
      <div className="lg:pt-1">
        <CaseStudyCue label={dict.common.caseStudy} />
      </div>
    </Card>
  );
}

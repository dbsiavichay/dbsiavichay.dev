import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cardLinkClass } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { getI18n } from "@/i18n/server";
import type { Note, Project } from "@/lib/content";

type NotesProps = {
  notes: Note[];
  projects: ReadonlyMap<string, Project>;
};

export async function Notes({ notes, projects }: NotesProps) {
  const { dict } = await getI18n();
  const t = dict.notes;

  return (
    <Section id="notes" labelledBy="notes-title">
      <SectionHeader
        index="03"
        eyebrow={t.eyebrow}
        titleId="notes-title"
        title={t.title}
        lede={t.lede}
      />
      <ol className="border-t border-line">
        {notes.map((note, i) => {
          const origin = note.projects
            .map((slug) => projects.get(slug)?.name ?? slug)
            .join(" · ");
          return (
            <li
              key={note.slug}
              className="group relative grid gap-3 border-b border-line py-7 transition-colors hover:bg-surface has-[.card-link:focus-visible]:outline-2 has-[.card-link:focus-visible]:outline-offset-2 has-[.card-link:focus-visible]:outline-focus md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,14rem)] md:gap-8 md:px-4"
            >
              <span
                aria-hidden="true"
                className="font-mono text-sm text-fg-subtle"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-balance text-fg">
                  <Link
                    href={note.href}
                    className={`${cardLinkClass} transition-colors group-hover:text-accent-text`}
                  >
                    {note.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-2xl text-fg-muted">{note.summary}</p>
              </div>
              <div className="flex items-start justify-between gap-4 md:flex-col md:items-end md:text-right">
                <p className="label-mono text-fg-subtle">
                  {t.from} · {origin}
                </p>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 text-fg-subtle transition-colors group-hover:text-accent-text"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

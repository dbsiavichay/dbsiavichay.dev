import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cardLinkClass } from "@/components/ui/card";
import type { Note } from "@/lib/content";

/** Notes as rows, the way the home page lists them. */
export function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className="border-t border-line">
      {notes.map((note) => (
        <li
          key={note.slug}
          className="group relative flex items-start justify-between gap-6 border-b border-line py-6 transition-colors hover:bg-surface has-[.card-link:focus-visible]:outline-2 has-[.card-link:focus-visible]:outline-offset-2 has-[.card-link:focus-visible]:outline-focus md:px-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-balance text-fg">
              <Link
                href={note.href}
                className={`${cardLinkClass} transition-colors group-hover:text-accent-text`}
              >
                {note.title}
              </Link>
            </h3>
            <p className="mt-1.5 max-w-2xl text-fg-muted">{note.summary}</p>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1.5 size-4 shrink-0 text-fg-subtle transition-colors group-hover:text-accent-text"
          />
        </li>
      ))}
    </ul>
  );
}

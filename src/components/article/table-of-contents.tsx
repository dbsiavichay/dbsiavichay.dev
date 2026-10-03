import { ChevronDown } from "lucide-react";

import type { Heading } from "@/lib/mdx-source";

import { ReadingStatus } from "./reading-status";

type TableOfContentsProps = {
  headings: Heading[];
  label: string;
};

function Links({ headings }: { headings: Heading[] }) {
  return (
    // `data-toc`: ReadingStatus marks the section being read in these links.
    <ol data-toc className="space-y-1 border-l border-line text-sm">
      {headings.map((heading, i) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className="group -ml-px flex gap-3 border-l border-transparent py-1.5 pr-2 pl-4 text-fg-muted transition-colors hover:border-accent hover:text-fg aria-[current=location]:border-accent aria-[current=location]:bg-raised aria-[current=location]:text-fg"
          >
            <span
              aria-hidden="true"
              className="font-mono text-xs leading-5 text-fg-subtle group-aria-[current=location]:text-accent-text"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{heading.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Above the text below `lg`: folded into a native disclosure, no JavaScript. */
export function TableOfContentsDisclosure({
  headings,
  label,
}: TableOfContentsProps) {
  return (
    <details className="group mb-12 rounded-lg border border-line bg-surface lg:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-3 label-mono text-fg [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-fg-subtle transition-transform group-open:rotate-180"
        />
      </summary>
      <nav aria-label={label} className="px-5 pb-5">
        <Links headings={headings} />
      </nav>
    </details>
  );
}

/**
 * Beside the text from `lg` up, sticky below the header, with a cursorline on
 * the section being read and a status line under it.
 */
export function TableOfContentsNav({ headings, label }: TableOfContentsProps) {
  return (
    <nav aria-labelledby="toc-title" className="sticky top-24">
      <p id="toc-title" className="mb-4 label-mono text-fg-subtle">
        {label}
      </p>
      <Links headings={headings} />
      <ReadingStatus ids={headings.map((heading) => heading.id)} />
    </nav>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Card, cardLinkClass } from "@/components/ui/card";

type NextLinkProps = {
  /** "Next case study", "Next note". */
  label: string;
  href: string;
  title: string;
  summary: string;
};

/** A card at the end of a page that leads to the next one in order. */
export function NextLink({ label, href, title, summary }: NextLinkProps) {
  return (
    <Card
      interactive
      className="group flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:p-8"
    >
      <div className="max-w-2xl">
        <p className="label-mono text-fg-subtle">{label}</p>
        <p className="mt-3 text-2xl font-semibold text-balance text-fg">
          <Link
            href={href}
            className={`${cardLinkClass} transition-colors group-hover:text-accent-text`}
          >
            {title}
          </Link>
        </p>
        <p className="mt-2 text-fg-muted">{summary}</p>
      </div>
      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 text-fg-subtle transition-colors group-hover:text-accent-text"
      />
    </Card>
  );
}

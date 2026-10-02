import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Two-digit index, as on the sheets of a drawing set: "01", "02"… */
  index: string;
  eyebrow: string;
  title: ReactNode;
  /** Id for the `<h2>`, referenced by the section's `aria-labelledby`. */
  titleId: string;
  lede?: ReactNode;
  className?: string;
};

/**
 * Index and eyebrow on the left, title and lede on the right from `lg` up;
 * stacked on smaller screens.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  titleId,
  lede,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "mb-12 grid gap-4 lg:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12",
        className,
      )}
    >
      <p className="flex items-center gap-3 label-mono text-fg-subtle lg:pt-3">
        <span className="text-accent-text">{index}</span>
        <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
        <span>{eyebrow}</span>
      </p>
      <div className="max-w-3xl">
        <h2
          id={titleId}
          className="text-3xl font-semibold text-balance text-fg"
        >
          {title}
        </h2>
        {lede ? (
          <p className="mt-4 text-lg text-pretty text-fg-muted">{lede}</p>
        ) : null}
      </div>
    </header>
  );
}

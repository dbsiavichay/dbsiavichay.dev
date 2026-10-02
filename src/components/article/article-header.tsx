import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

type ArticleHeaderProps = {
  /** Where the reader came from: the home section that lists this page. */
  back: { href: string; label: string };
  breadcrumbLabel: string;
  /** Mono labels above the title: kind, relation, reading time… */
  eyebrow: ReactNode;
  title: string;
  lede: string;
  children?: ReactNode;
};

/** The top of a case study or a note, on the drafting grid of the hero. */
export function ArticleHeader({
  back,
  breadcrumbLabel,
  eyebrow,
  title,
  lede,
  children,
}: ArticleHeaderProps) {
  return (
    <header className="border-b border-line blueprint-grid">
      <Container className="py-10 sm:py-14 lg:py-20">
        <nav aria-label={breadcrumbLabel}>
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 rounded-sm label-mono text-fg-subtle transition-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {back.label}
          </Link>
        </nav>
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 label-mono text-fg-subtle lg:mt-14">
          {eyebrow}
        </div>
        <h1 className="mt-5 max-w-4xl text-display font-semibold text-balance">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-pretty text-fg-muted sm:text-xl sm:leading-relaxed">
          {lede}
        </p>
        {children}
      </Container>
    </header>
  );
}

/** A thin rule between the labels of the eyebrow. */
export function EyebrowRule() {
  return <span aria-hidden="true" className="h-px w-6 bg-line-strong" />;
}

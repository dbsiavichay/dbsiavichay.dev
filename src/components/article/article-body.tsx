import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import type { Heading } from "@/lib/mdx-source";

import {
  TableOfContentsDisclosure,
  TableOfContentsNav,
} from "./table-of-contents";

type ArticleBodyProps = {
  headings: Heading[];
  tocLabel: string;
  children: ReactNode;
};

/** The MDX text in its reading measure, with the page's sections beside it. */
export function ArticleBody({
  headings,
  tocLabel,
  children,
}: ArticleBodyProps) {
  const toc = headings.length > 1;
  return (
    <Container className="grid gap-x-16 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:py-24">
      <div className="min-w-0">
        {toc ? (
          <TableOfContentsDisclosure headings={headings} label={tocLabel} />
        ) : null}
        <div className="prose [&>:first-child]:mt-0">{children}</div>
      </div>
      {toc ? (
        <div className="hidden lg:block">
          <TableOfContentsNav headings={headings} label={tocLabel} />
        </div>
      ) : null}
    </Container>
  );
}

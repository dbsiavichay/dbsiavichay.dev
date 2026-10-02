import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  /** Anchor target; also used by the navbar links. */
  id: string;
  /** Id of the heading that names this landmark. */
  labelledBy: string;
  /** Hairline separating this section from the previous one. */
  divided?: boolean;
};

/** A landmark section with the vertical rhythm of the page. */
export function Section({
  id,
  labelledBy,
  divided = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-section", divided && "border-t border-line", className)}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  );
}

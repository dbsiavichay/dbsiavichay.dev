import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type CardProps<T extends ElementType> = {
  as?: T;
  /**
   * For cards that are a link as a whole. Put the link on the card's title
   * and give it `card-link` so its hit area stretches over the card while the
   * accessible name stays the title, not the whole card's text.
   */
  interactive?: boolean;
} & ComponentPropsWithoutRef<T>;

export function Card<T extends ElementType = "div">({
  as,
  interactive = false,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "relative rounded-lg border border-line bg-surface p-6",
        interactive &&
          "transition-colors duration-150 hover:border-line-strong has-[.card-link:focus-visible]:outline-2 has-[.card-link:focus-visible]:outline-offset-3 has-[.card-link:focus-visible]:outline-focus",
        className,
      )}
      {...props}
    />
  );
}

/** Stretches a title link over its card. Its focus ring is drawn on the card. */
export const cardLinkClass =
  "card-link outline-none after:absolute after:inset-0 after:rounded-lg after:content-['']";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn, isExternalHref } from "@/lib/utils";

type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

/** An inline link: underlined at rest, accent underline on hover. */
export function TextLink({ href, className, ...props }: TextLinkProps) {
  const classes = cn(
    "text-fg underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:decoration-accent",
    className,
  );
  if (isExternalHref(href))
    return <a href={href} className={classes} {...props} />;
  return <Link href={href} className={classes} {...props} />;
}

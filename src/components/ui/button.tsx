import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn, isExternalHref } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type StyleProps = {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary:
    "border border-line-strong text-fg hover:border-fg-muted hover:bg-surface",
  ghost: "text-fg-muted hover:bg-surface hover:text-fg",
};

// `md` keeps a 44px touch target; `sm` is for dense desktop toolbars.
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
}: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size]);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & StyleProps;

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> &
  StyleProps & {
    href: string;
    children: ReactNode;
  };

/**
 * A link styled as a button. Internal paths use Next's `<Link>`; external and
 * `mailto:` links are plain anchors and open in the same tab.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  ...props
}: ButtonLinkProps) {
  const classes = cn(buttonStyles({ variant, size }), className);
  if (isExternalHref(href)) {
    return <a href={href} className={classes} {...props} />;
  }
  return <Link href={href} className={classes} {...props} />;
}

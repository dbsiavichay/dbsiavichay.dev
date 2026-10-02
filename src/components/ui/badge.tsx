import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type Variant = "neutral" | "accent" | "outline";

const variants: Record<Variant, string> = {
  neutral: "border-line bg-surface text-fg-muted",
  accent: "border-transparent bg-accent-soft text-accent-text",
  outline: "border-line-strong text-fg-muted",
};

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: Variant;
  /** A small status dot before the label. */
  dot?: boolean;
};

/** A compact, monospaced tag: technologies, statuses, periods. */
export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}

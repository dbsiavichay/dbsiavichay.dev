import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line bg-raised px-1 font-mono text-xs text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

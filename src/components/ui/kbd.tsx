import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type KbdProps = ComponentPropsWithoutRef<"kbd"> & {
  /** `sm` sits in a line of text or a button; `lg` stands on its own. */
  size?: "sm" | "lg";
  /** Drawn pressed: the face sunk into its edge. */
  pressed?: boolean;
};

const sizes = {
  sm: "h-5 min-w-5 rounded-[5px] px-1 text-xs",
  lg: "h-9 min-w-9 rounded-md px-2 text-sm [--keycap-depth:3px]",
} as const;

/**
 * A key, drawn as a low-profile keycap. Client components can't import this
 * (it would ship `cn`): they use the `keycap` utility directly.
 */
export function Kbd({
  size = "sm",
  pressed = false,
  className,
  ...props
}: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex keycap items-center justify-center font-mono",
        sizes[size],
        pressed && "keycap-pressed",
        className,
      )}
      {...props}
    />
  );
}

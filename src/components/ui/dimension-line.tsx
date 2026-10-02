import { cn } from "@/lib/utils";

type DimensionLineProps = {
  /** Text set in the middle of the line, like a measurement on a drawing. */
  label?: string;
  className?: string;
};

/**
 * A dimension line from a technical drawing: end ticks, a hairline and an
 * optional label. Purely decorative, so it is hidden from assistive tech.
 */
export function DimensionLine({ label, className }: DimensionLineProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex items-center gap-2 text-fg-subtle", className)}
    >
      <span className="h-2.5 w-px bg-line-strong" />
      <span className="h-px flex-1 bg-line-strong" />
      {label ? <span className="shrink-0 label-mono">{label}</span> : null}
      {label ? <span className="h-px flex-1 bg-line-strong" /> : null}
      <span className="h-2.5 w-px bg-line-strong" />
    </span>
  );
}

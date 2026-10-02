// content-pending: ignore-file (renders the marker, it is not a pending fact)
import {
  PENDING_MARKER,
  shouldShowPending,
  type Pending as PendingValue,
} from "@/lib/pending";
import { cn } from "@/lib/utils";

type PendingProps = {
  value: PendingValue;
  className?: string;
};

/**
 * Shows an unconfirmed fact as a dashed TODO badge while developing, and
 * renders nothing in production. Unconfirmed information is never published.
 */
export function Pending({ value, className }: PendingProps) {
  if (!shouldShowPending()) return null;
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-1.5 rounded-sm border border-dashed border-signal-error px-1.5 py-0.5 font-mono text-xs text-signal-error",
        className,
      )}
    >
      <strong className="font-semibold">{PENDING_MARKER}</strong>
      <span>— {value.note}</span>
    </span>
  );
}

type PendingListProps = {
  values: readonly PendingValue[] | undefined;
  className?: string;
};

/** Several unconfirmed facts about one thing, stacked. Nothing in production. */
export function PendingList({ values, className }: PendingListProps) {
  if (!values?.length || !shouldShowPending()) return null;
  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      {values.map((value) => (
        <Pending key={value.note} value={value} />
      ))}
    </div>
  );
}

// content-pending: ignore-file (this file defines the marker, it is not a pending fact)

/**
 * The literal marker the brief asks for wherever a fact is not confirmed.
 * `npm run content:pending` lists every occurrence in `src/`.
 */
export const PENDING_MARKER = "TODO: CONFIRM WITH DENIS";

/** A fact that has not been confirmed yet. It is never published as if it were true. */
export type Pending = {
  readonly kind: "pending";
  /** What exactly needs confirming, for whoever reads the TODO. */
  readonly note: string;
};

/** A value that is either known or explicitly pending confirmation. */
export type Confirmable<T> = T | Pending;

export function pending(note: string): Pending {
  return { kind: "pending", note };
}

export function isPending(value: unknown): value is Pending {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { kind?: unknown }).kind === "pending" &&
    typeof (value as { note?: unknown }).note === "string"
  );
}

/** The confirmed value, or `undefined` while it is still pending. */
export function confirmed<T>(value: Confirmable<T>): T | undefined {
  return isPending(value) ? undefined : value;
}

/**
 * Whether pending markers should be rendered. They are visible while
 * developing and hidden in production builds, unless a preview deploy opts in
 * with `NEXT_PUBLIC_SHOW_PENDING=true`.
 */
export function shouldShowPending(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_SHOW_PENDING === "true"
  );
}

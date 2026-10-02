import type { ReactNode } from "react";

type AsideProps = {
  /** Short mono label: "Trade-off", "What I'd change"… */
  label: string;
  children: ReactNode;
};

/**
 * A remark set apart from the running text. A `role="note"` block rather
 * than an `<aside>`, which would be a landmark nested inside `<main>`.
 */
export function Aside({ label, children }: AsideProps) {
  return (
    <div
      role="note"
      className="my-10 rounded-r-md border-l-2 border-accent bg-surface px-5 py-4 text-base text-fg-muted [&>p]:my-2"
    >
      <p className="label-mono text-accent-text">{label}</p>
      {children}
    </div>
  );
}

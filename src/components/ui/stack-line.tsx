import { cn } from "@/lib/utils";

type StackLineProps = {
  items: readonly string[];
  className?: string;
};

/**
 * A stack as a line of text, the way a README lists it, not a row of boxes.
 * A line breaks between technologies, never inside one.
 */
export function StackLine({ items, className }: StackLineProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-fg-subtle",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={item} className="whitespace-nowrap">
          {item}
          {i < items.length - 1 ? (
            <span aria-hidden="true" className="ml-2">
              ·
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

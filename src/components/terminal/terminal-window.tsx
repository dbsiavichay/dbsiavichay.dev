import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type TerminalWindowProps<T extends ElementType> = {
  as?: T;
  /** Shown in the title bar. The caller decides whether it is a heading. */
  title: ReactNode;
  /** The bar under the output, like a status line. */
  status?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "title">;

/**
 * A terminal window: a title bar with the three window dots, the output and
 * an optional status bar. It is a screen, so it stays dark in both themes
 * (D36), and its chrome is drawn in CSS: the font subset has no box-drawing
 * characters.
 */
export function TerminalWindow<T extends ElementType = "section">({
  as,
  title,
  status,
  className,
  children,
  ...props
}: TerminalWindowProps<T>) {
  const Component = as ?? "section";
  return (
    <Component
      className={cn(
        "overflow-hidden rounded-[11px] border border-term-line bg-term text-term-fg",
        className,
      )}
      {...props}
    >
      <div className="flex h-10 items-center gap-3 border-b border-term-line bg-term-bar px-4">
        <span aria-hidden="true" className="flex w-12 shrink-0 gap-[7px]">
          <span className="size-2.5 rounded-full bg-term-dot" />
          <span className="size-2.5 rounded-full bg-term-dot" />
          <span className="size-2.5 rounded-full bg-term-dot" />
        </span>
        <div className="flex min-w-0 flex-1 font-mono text-xs text-term-muted sm:justify-center">
          {title}
        </div>
        {/* Balances the dots, so the title is centred on the window. */}
        <span aria-hidden="true" className="hidden w-12 shrink-0 sm:block" />
      </div>
      <div className="px-4 py-4 path-mono sm:px-5 sm:py-5">{children}</div>
      {status ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-term-line bg-term-bar px-4 py-1.5 font-mono text-xs text-term-muted">
          {status}
        </div>
      ) : null}
    </Component>
  );
}

type PromptProps = {
  command?: string;
  /** Types the command once, starting after this many milliseconds. */
  typeAfter?: number;
  /** What follows the command on the line, such as the cursor. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * A shell prompt and its command. Decorative: screen readers get the output,
 * not the commands that print it.
 */
export function Prompt({
  command,
  typeAfter,
  children,
  className,
  style,
}: PromptProps) {
  const typed = typeAfter !== undefined;
  return (
    <p
      aria-hidden="true"
      className={cn("flex items-center gap-2", className)}
      style={style}
    >
      <span className="text-term-accent">$</span>
      {command ? (
        <span
          className={cn(typed && "inline-block motion-safe:animate-type")}
          style={
            typed
              ? ({
                  "--chars": command.length,
                  animationDelay: `${typeAfter}ms`,
                } as CSSProperties)
              : undefined
          }
        >
          {command}
        </span>
      ) : null}
      {children}
    </p>
  );
}

/** A block cursor. With `blinkAfter`, it blinks five times and stays lit. */
export function Cursor({ blinkAfter }: { blinkAfter?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-4 w-2 bg-term-accent",
        blinkAfter !== undefined && "motion-safe:animate-blink",
      )}
      style={
        blinkAfter !== undefined
          ? { animationDelay: `${blinkAfter}ms` }
          : undefined
      }
    />
  );
}

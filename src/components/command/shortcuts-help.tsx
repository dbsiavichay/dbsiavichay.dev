"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";

import { exNames } from "./commands";
import { goTargets, setShortcutsEnabled, shortcutsEnabled } from "./shortcuts";

// The `Kbd` look without importing it: `cn` stays on the server.
const keyClass =
  "inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] px-1.5 font-mono text-xs keycap";

type Row = { keys: string[]; label: string; detail?: string };

export type ShortcutsHelpProps = {
  open: boolean;
  onClose: () => void;
  labels: Dictionary["shortcuts"];
  apple: boolean;
};

/**
 * The `?` help: every shortcut, drawn as keycaps, and the switch that turns
 * the Vim-style ones off (WCAG 2.1.4). It also opens from the footer and
 * from ⌘K, so whoever turned them off can turn them back on.
 */
export default function ShortcutsHelp({
  open,
  onClose,
  labels,
  apple,
}: ShortcutsHelpProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [enabled, setEnabled] = useState(shortcutsEnabled);
  const id = useId();
  const search = apple ? "⌘K" : "Ctrl K";

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const groups: [title: string, rows: Row[]][] = [
    [
      labels.groups.anywhere,
      [
        { keys: [apple ? "⌘" : "Ctrl", "K"], label: labels.keys.search },
        { keys: ["/"], label: labels.keys.search },
        {
          keys: [":"],
          label: labels.keys.command,
          detail: exNames.join(" "),
        },
        { keys: ["?"], label: labels.keys.help },
        { keys: ["Esc"], label: labels.keys.close },
      ],
    ],
    [
      labels.groups.go,
      [...goTargets].map(([key, section]) => ({
        keys: ["g", key],
        label: labels.go[(section || "home") as keyof typeof labels.go],
      })),
    ],
    [
      labels.groups.page,
      [
        { keys: ["j"], label: labels.keys.next },
        { keys: ["k"], label: labels.keys.previous },
      ],
    ],
  ];

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-intro`}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself.
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
      className="mx-auto mt-[10vh] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden rounded-lg border border-line-strong bg-surface p-0 text-fg backdrop:bg-canvas/80"
    >
      <div className="flex max-h-[min(44rem,84vh)] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line py-1.5 pr-1.5 pl-5">
          <h2 id={`${id}-title`} className="label-mono text-fg">
            {labels.title}
          </h2>
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => dialog.current?.close()}
            className="inline-flex size-11 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-5">
          <p id={`${id}-intro`} className="text-sm text-fg-muted">
            {labels.intro}
          </p>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => {
              setShortcutsEnabled(!enabled);
              setEnabled(!enabled);
            }}
            className="group mt-5 flex min-h-11 w-full items-center justify-between gap-4 rounded-md border border-line-strong px-4 py-2 text-left text-sm text-fg"
          >
            {labels.toggle}
            <span
              aria-hidden="true"
              className="flex h-5 w-9 shrink-0 items-center rounded-full border border-line-strong bg-raised p-0.5 transition-colors group-aria-checked:border-accent group-aria-checked:bg-accent"
            >
              <span className="size-3.5 rounded-full bg-fg-subtle transition-transform group-aria-checked:translate-x-4 group-aria-checked:bg-on-accent motion-reduce:transition-none" />
            </span>
          </button>
          <p className="mt-2 text-xs text-fg-subtle">
            {labels.always.replace("{search}", search)}
          </p>

          <div className="sm:grid sm:grid-cols-2 sm:gap-x-10">
            {groups.map(([title, rows], group) => (
              <section key={title} aria-labelledby={`${id}-${group}`}>
                <h3
                  id={`${id}-${group}`}
                  className="mt-6 mb-3 label-mono text-fg-subtle"
                >
                  {title}
                </h3>
                <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
                  {rows.map((row) => (
                    <div key={row.keys.join(" ")} className="contents">
                      <dt className="flex gap-1">
                        {row.keys.map((key) => (
                          <kbd key={key} className={keyClass}>
                            {key}
                          </kbd>
                        ))}
                      </dt>
                      <dd className="self-center text-fg-muted">
                        {row.label}
                        {row.detail ? (
                          <span className="mt-1 block font-mono text-xs text-fg-subtle">
                            {row.detail}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
}

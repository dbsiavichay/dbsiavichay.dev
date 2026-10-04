"use client";

import {
  ArrowUpRight,
  Code,
  Copy,
  FileText,
  FolderOpen,
  Hash,
  Keyboard,
  Languages,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { GitHubIcon, LinkedInIcon } from "@/components/icons/brand-icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/paths";
import { rememberLocale } from "@/i18n/remember-locale";
import { scrollIfCurrent } from "@/lib/same-page";

import {
  commandWord,
  groupResults,
  runQuery,
  type Command,
  type CommandIcon,
} from "./commands";

const icons: Record<CommandIcon, ReactNode> = {
  section: <Hash />,
  project: <FolderOpen />,
  note: <FileText />,
  language: <Languages />,
  copy: <Copy />,
  keyboard: <Keyboard />,
  close: <X />,
  github: <GitHubIcon />,
  linkedin: <LinkedInIcon />,
  source: <Code />,
};

export type CommandPaletteProps = {
  open: boolean;
  /** What the search starts with when it opens: ":" for command mode. */
  start: string;
  onClose: () => void;
  onHelp: () => void;
  /** Called after an action that has no page change to show for itself. */
  onDone: (message: string) => void;
  commands: Command[];
  labels: Dictionary["command"];
  copiedLabel: string;
};

/**
 * The ⌘K menu: a modal dialog with a combobox. Typing filters, the arrow
 * keys move through the results, Enter runs one and Escape closes. Focus
 * stays in the input; the active option is announced through
 * `aria-activedescendant`. A query that starts with `:` is command mode.
 */
export default function CommandPalette({
  open,
  start,
  onClose,
  onHelp,
  onDone,
  commands,
  labels,
  copiedLabel,
}: CommandPaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (command: Command) => `${id}-${command.id}`;

  // Each time it opens, the search starts from `start`.
  if (open !== shown) {
    setShown(open);
    if (open) setQuery(start);
  }

  const groups = useMemo(
    () => groupResults(runQuery(commands, query, labels)),
    [commands, query, labels],
  );
  const ordered = groups.flatMap((group) =>
    group.items.map((item) => item.command),
  );
  const current = ordered[active];
  const activeId = current ? optionId(current) : undefined;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      input.current?.focus();
    }
    if (!open && element.open) element.close();
  }, [open]);

  // Keep the active option in view while the arrow keys move through a long list.
  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeId]);

  const word = commandWord(query);
  const empty =
    word === undefined
      ? labels.empty.replace("{query}", query.trim())
      : labels.notCommand.replace("{command}", word);

  function close() {
    setQuery("");
    setActive(0);
    onClose();
  }

  function run(command: Command) {
    const { action } = command;
    close();
    switch (action.type) {
      case "navigate":
        if (!scrollIfCurrent(action.href)) router.push(action.href);
        break;
      case "external":
        window.open(action.href, "_blank", "noopener,noreferrer");
        break;
      case "copy":
        navigator.clipboard
          .writeText(action.text)
          .then(() => onDone(copiedLabel))
          .catch(() => {
            // Clipboard access denied: the address is in the Contact section.
          });
        break;
      case "locale":
        rememberLocale(action.locale);
        router.push(localizedPath(pathname ?? "/", action.locale));
        break;
      case "help":
        onHelp();
        break;
      case "quit":
        onDone(labels.quitDone);
        break;
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = ordered.length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (count === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((value) => (value + step + count) % count);
    } else if (event.key === "Enter" && current) {
      event.preventDefault();
      run(current);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label={labels.title}
      onClose={close}
      // A click on the backdrop lands on the dialog itself.
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      className="mx-auto mt-[12vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden rounded-lg border border-line-strong bg-surface p-0 text-fg backdrop:bg-canvas/80"
    >
      <div className="flex max-h-[min(34rem,76vh)] flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-fg-subtle"
          />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded={ordered.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label={labels.title}
            placeholder={labels.placeholder}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            className={`h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle ${
              // Command mode reads like Vim's command line.
              word === undefined ? "" : "font-mono"
            }`}
          />
        </div>

        {ordered.length > 0 ? (
          <div
            role="listbox"
            id={listId}
            aria-label={labels.results}
            className="overflow-y-auto overscroll-contain p-2"
          >
            {groups.map(({ group, items }) => (
              <div
                key={group}
                role="group"
                aria-labelledby={`${id}-${group}`}
                className="pb-1"
              >
                <div
                  id={`${id}-${group}`}
                  aria-hidden="true"
                  className="px-3 pt-3 pb-1.5 label-mono text-fg-subtle"
                >
                  {labels.groups[group]}
                </div>
                {items.map(({ command, index }) => (
                  <div
                    key={command.id}
                    id={optionId(command)}
                    role="option"
                    aria-selected={index === active}
                    onClick={() => run(command)}
                    onMouseMove={() => {
                      if (index !== active) setActive(index);
                    }}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-fg-muted aria-selected:bg-raised aria-selected:text-fg [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <span aria-hidden="true" className="text-fg-subtle">
                      {icons[command.icon]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span
                        className={
                          group === "commands" ? "font-mono text-fg" : "text-fg"
                        }
                      >
                        {command.label}
                      </span>
                      {command.hint ? (
                        <span className="ml-2 text-fg-subtle">
                          {command.hint}
                        </span>
                      ) : null}
                    </span>
                    {command.action.type === "external" ? (
                      <ArrowUpRight
                        aria-hidden="true"
                        className="text-fg-subtle"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : word === undefined ? (
          <p className="px-4 py-10 text-center text-sm text-fg-muted">
            {empty}
          </p>
        ) : (
          // Vim's error line, and the way out of it.
          <div className="px-4 py-8 font-mono text-sm">
            <p className="text-signal-error">{empty}</p>
            <p className="mt-2 text-fg-muted">{labels.notCommandHint}</p>
          </div>
        )}
        <p role="status" className="sr-only">
          {ordered.length > 0
            ? ""
            : word === undefined
              ? empty
              : `${empty} ${labels.notCommandHint}`}
        </p>

        <div className="flex gap-5 border-t border-line px-4 py-2.5 font-mono text-xs text-fg-subtle max-sm:hidden [@media(hover:none)]:hidden">
          <span>
            <span aria-hidden="true">↑↓</span> {labels.hints.navigate}
          </span>
          <span>
            <span aria-hidden="true">↵</span> {labels.hints.open}
          </span>
          <span>
            <span aria-hidden="true">esc</span> {labels.hints.close}
          </span>
        </div>
      </div>
    </dialog>
  );
}

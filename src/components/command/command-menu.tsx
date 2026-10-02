"use client";

import { Search } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { Dictionary } from "@/i18n/get-dictionary";

import type { Command } from "./commands";

// The dialog loads the first time it's needed, not with every page.
const CommandPalette = lazy(() => import("./command-palette"));

function preload() {
  void import("./command-palette");
}

const subscribe = () => () => {};

/** Apple keyboards say ⌘; the rest say Ctrl. The server renders ⌘. */
function isApple() {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad/i.test(platform);
}

type CommandMenuProps = {
  commands: Command[];
  labels: Dictionary["command"];
  copiedLabel: string;
};

/** The search button in the header, and the ⌘K / Ctrl+K shortcut. */
export function CommandMenu({
  commands,
  labels,
  copiedLabel,
}: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const apple = useSyncExternalStore(subscribe, isApple, () => true);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setMounted(true);
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <>
      <button
        type="button"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        onPointerEnter={preload}
        onFocus={preload}
        className="inline-flex size-11 items-center justify-center gap-2 rounded-md text-fg transition-colors hover:bg-surface md:h-9 md:w-auto md:border md:border-line-strong md:px-2.5 md:text-fg-muted md:hover:bg-transparent md:hover:text-fg"
      >
        <Search aria-hidden="true" className="size-4" />
        <kbd
          aria-hidden="true"
          className="hidden h-5 w-11 items-center justify-center rounded-sm border border-line bg-raised font-mono text-xs text-fg-muted lg:inline-flex"
        >
          {apple ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {mounted ? (
        <Suspense fallback={null}>
          <CommandPalette
            open={open}
            onClose={() => setOpen(false)}
            onDone={setMessage}
            commands={commands}
            labels={labels}
            copiedLabel={copiedLabel}
          />
        </Suspense>
      ) : null}

      <p
        role="status"
        className={
          message
            ? "fixed inset-x-4 bottom-6 z-50 mx-auto w-fit rounded-md border border-line-strong bg-raised px-4 py-2.5 text-sm text-fg"
            : "sr-only"
        }
      >
        {message}
      </p>
    </>
  );
}

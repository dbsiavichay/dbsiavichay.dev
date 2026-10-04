"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { scrollIfCurrent } from "@/lib/same-page";

import type { Command } from "./commands";
import {
  ignoreKey,
  resolveKey,
  shortcutsEnabled,
  stepSection,
} from "./shortcuts";

// The dialogs load the first time they're needed, not with every page.
const CommandPalette = lazy(() => import("./command-palette"));
const ShortcutsHelp = lazy(() => import("./shortcuts-help"));

function preload() {
  void import("./command-palette");
}

const subscribe = () => () => {};

// The `Kbd` look without importing it: `cn` stays on the server.
const keyClass =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] px-1 font-mono text-xs keycap group-active:keycap-pressed";

/** What `j` and `k` move between: the home's sections, or an article's h2. */
const SECTIONS = "main section[id], .prose h2[id]";

/** Apple keyboards say ⌘; the rest say Ctrl. The server renders ⌘. */
function isApple() {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad/i.test(platform);
}

type CommandMenuProps = {
  locale: Locale;
  commands: Command[];
  labels: Dictionary["command"];
  shortcuts: Dictionary["shortcuts"];
  copiedLabel: string;
};

/**
 * The search button in the header, ⌘K / Ctrl+K, and the Vim-style keys:
 * `/` and `:` open the search, `?` the help, `g` and a letter go to a part of
 * the home, and `j` / `k` move between sections.
 */
export function CommandMenu({
  locale,
  commands,
  labels,
  shortcuts,
  copiedLabel,
}: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [start, setStart] = useState("");
  // Undefined until the help is first asked for.
  const [help, setHelp] = useState<boolean>();
  const [message, setMessage] = useState("");
  const apple = useSyncExternalStore(subscribe, isApple, () => true);
  const router = useRouter();
  const gAt = useRef<number>(undefined);
  const lastMove = useRef({ index: -1, at: -Infinity });

  useEffect(() => {
    console.info(shortcuts.greeting);
  }, [shortcuts.greeting]);

  useEffect(() => {
    function search(query: string) {
      setStart(query);
      setMounted(true);
      setOpen(true);
    }

    function move(forward: boolean, at: number) {
      const targets = [...document.querySelectorAll(SECTIONS)];
      const line = parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );
      const index = stepSection(
        targets.map((target) => target.getBoundingClientRect().top),
        line || 0,
        forward,
        at - lastMove.current.at < 800 ? lastMove.current.index : undefined,
      );
      if (index < 0 && forward) return;
      lastMove.current = { index, at };
      const target = targets[index];
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    }

    function go(section: string) {
      const href = `/${locale}${section && `#${section}`}`;
      if (!scrollIfCurrent(href)) router.push(href);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setStart("");
        setMounted(true);
        setOpen((value) => !value);
        return;
      }
      if (ignoreKey(event) || !shortcutsEnabled()) return;

      const shortcut = resolveKey(event.key, event.timeStamp, gAt.current);
      gAt.current = undefined;
      if (!shortcut) return;
      event.preventDefault();
      if (shortcut === "g") gAt.current = event.timeStamp;
      else if (shortcut === "search") search("");
      else if (shortcut === "command") search(":");
      else if (shortcut === "help") setHelp(true);
      else if (typeof shortcut === "object") go(shortcut.go);
      else move(shortcut === "next", event.timeStamp);
    }

    function onClick(event: MouseEvent) {
      const target = event.target as Element;
      // The footer's button is server-rendered; it only carries this attribute.
      if (target.closest?.("[data-shortcuts-help]")) setHelp(true);
      // A `Link` to the URL the page is already on: the router took the click
      // (and prevented the browser's own jump) but won't scroll, so this does.
      const link = target.closest?.("a[href]");
      if (link instanceof HTMLAnchorElement && event.defaultPrevented) {
        scrollIfCurrent(link.href);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [locale, router]);

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
          setStart("");
          setMounted(true);
          setOpen(true);
        }}
        onPointerEnter={preload}
        onFocus={preload}
        className="group inline-flex size-11 items-center justify-center gap-2 rounded-md text-fg transition-colors hover:bg-surface md:h-9 md:w-auto md:border md:border-line-strong md:px-2.5 md:text-fg-muted md:hover:bg-transparent md:hover:text-fg"
      >
        <Search aria-hidden="true" className="size-4" />
        {/* Keycaps for the shortcut; they sink when the button is pressed.
            A touch screen has no keyboard to hint at. */}
        <span
          aria-hidden="true"
          className="hidden gap-1 lg:inline-flex [@media(hover:none)]:hidden"
        >
          <kbd className={keyClass}>{apple ? "⌘" : "Ctrl"}</kbd>
          <kbd className={keyClass}>K</kbd>
        </span>
      </button>

      {mounted ? (
        <Suspense fallback={null}>
          <CommandPalette
            open={open}
            start={start}
            onClose={() => setOpen(false)}
            onHelp={() => setHelp(true)}
            onDone={setMessage}
            commands={commands}
            labels={labels}
            copiedLabel={copiedLabel}
          />
        </Suspense>
      ) : null}

      {help !== undefined ? (
        <Suspense fallback={null}>
          <ShortcutsHelp
            open={help}
            onClose={() => setHelp(false)}
            labels={shortcuts}
            apple={apple}
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

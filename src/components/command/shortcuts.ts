/**
 * The site's Vim-style keys, as pure logic. The ⌘K island listens for them
 * and does what these functions decide; the help lists them.
 */

/** `g` and then one of these goes to a part of the home; "" is its top. */
export const goTargets = new Map([
  ["h", ""],
  ["p", "work"],
  ["n", "notes"],
  ["e", "experience"],
  ["a", "about"],
  ["c", "contact"],
]);

export type Shortcut =
  "search" | "command" | "help" | "next" | "previous" | "g" | { go: string };

const single = new Map<string, Shortcut>([
  ["/", "search"],
  [":", "command"],
  ["?", "help"],
  ["j", "next"],
  ["k", "previous"],
  ["g", "g"],
]);

/** How long the key after `g` has to complete the sequence. */
export const SEQUENCE_MS = 1000;

/**
 * What a key does. `gAt` is when `g` was pressed, if it was the key before:
 * the next one completes the sequence only within a second.
 */
export function resolveKey(
  key: string,
  at: number,
  gAt?: number,
): Shortcut | undefined {
  const go =
    gAt !== undefined && at - gAt <= SEQUENCE_MS
      ? goTargets.get(key)
      : undefined;
  return go === undefined ? single.get(key) : { go };
}

/**
 * Keys never act while someone types, with Ctrl, ⌘ or Alt held, in the middle
 * of an IME composition, or while a dialog is open.
 */
export function ignoreKey(event: KeyboardEvent): boolean {
  const target = event.target as Element | null;
  return (
    event.defaultPrevented ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.isComposing ||
    !!target?.closest?.(
      "input, textarea, select, [contenteditable]:not([contenteditable=false])",
    ) ||
    !!document.querySelector("dialog[open]")
  );
}

const STORAGE_KEY = "shortcuts";
let choice: boolean | undefined;

/**
 * On unless the visitor turned them off. When the browser blocks storage,
 * they start on and a change lasts until the page reloads.
 */
export function shortcutsEnabled(): boolean {
  if (choice !== undefined) return choice;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setShortcutsEnabled(on: boolean) {
  choice = on;
  try {
    if (on) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    // Storage blocked: the choice holds for this visit.
  }
}

/**
 * The section `j` (forward) or `k` moves to, given where the sections' tops
 * are and the line a section stops at when it's scrolled to: the first one
 * below the line, or the last one above it. `from` is the section a press a
 * moment ago went to, so quick presses don't stall on a smooth scroll still
 * in progress. -1 means none: the top of the page, going back.
 */
export function stepSection(
  tops: readonly number[],
  line: number,
  forward: boolean,
  from?: number,
): number {
  if (from !== undefined) {
    const next = from + (forward ? 1 : -1);
    return next < tops.length ? Math.max(next, -1) : -1;
  }
  return forward
    ? tops.findIndex((top) => top > line + 1)
    : tops.findLastIndex((top) => top < line - 1);
}

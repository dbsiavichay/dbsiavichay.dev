import type { Locale } from "@/i18n/config";

/** What choosing a command does. */
export type CommandAction =
  | { type: "navigate"; href: string }
  | { type: "external"; href: string }
  | { type: "copy"; text: string }
  | { type: "locale"; locale: Locale };

export const commandGroups = [
  "projects",
  "notes",
  "sections",
  "actions",
] as const;

export type CommandGroup = (typeof commandGroups)[number];

export type CommandIcon =
  | "section"
  | "project"
  | "note"
  | "language"
  | "copy"
  | "github"
  | "linkedin"
  | "source";

export type Command = {
  id: string;
  group: CommandGroup;
  icon: CommandIcon;
  label: string;
  /** A muted line after the label. */
  hint?: string;
  /** More words that should find the command. */
  keywords?: string[];
  action: CommandAction;
};

/** Lowercase, without accents: "Gestión" and "gestion" are the same search. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function score(command: Command, words: string[]): number {
  const label = normalize(command.label);
  const labelWords = label.split(/[^a-z0-9]+/);
  const rest = normalize(
    [command.hint ?? "", ...(command.keywords ?? [])].join(" "),
  );
  let total = 0;
  for (const word of words) {
    if (label.startsWith(word)) total += 4;
    else if (labelWords.some((w) => w.startsWith(word))) total += 3;
    else if (label.includes(word)) total += 2;
    else if (rest.includes(word)) total += 1;
    else return 0;
  }
  return total;
}

/**
 * The commands that match a query, best first. Every word of the query has
 * to appear in the command; a match in the label counts more than one in the
 * hint or the keywords, and ties keep the original order.
 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return commands;
  return commands
    .map((command, order) => ({ command, order, score: score(command, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.command);
}

/**
 * Results grouped for display. Groups appear in the order of their best
 * result, so the first option is always the best match; each item keeps its
 * position in the flat list, which is what the arrow keys walk.
 */
export function groupResults(results: Command[]) {
  const groups = new Map<CommandGroup, { command: Command; index: number }[]>();
  for (const command of results) {
    const list = groups.get(command.group) ?? [];
    list.push({ command, index: 0 });
    groups.set(command.group, list);
  }
  let index = 0;
  return [...groups].map(([group, items]) => ({
    group,
    items: items.map((item) => ({ ...item, index: index++ })),
  }));
}

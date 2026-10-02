import { describe, expect, it } from "vitest";

import {
  filterCommands,
  groupResults,
  normalize,
  type Command,
} from "@/components/command/commands";

const command = (
  id: string,
  group: Command["group"],
  label: string,
  extra: Partial<Command> = {},
): Command => ({
  id,
  group,
  icon: "section",
  label,
  action: { type: "navigate", href: `/en#${id}` },
  ...extra,
});

const commands: Command[] = [
  command("maderable", "projects", "Maderable", {
    hint: "Quoting, cut optimization and production",
    keywords: ["FastAPI", "Rust"],
  }),
  command("salon", "projects", "Gestión de salón", {
    hint: "Agenda, pagos y caja",
  }),
  command("work", "sections", "Selected work"),
  command("stack", "sections", "Stack", { keywords: ["stack"] }),
  command("email", "actions", "Copy email address", {
    keywords: ["contact"],
  }),
];

const ids = (list: Command[]) => list.map((c) => c.id);

describe("normalize", () => {
  it("ignores case and accents", () => {
    expect(normalize("Gestión de SALÓN")).toBe("gestion de salon");
  });
});

describe("filterCommands", () => {
  it("returns everything, in order, for an empty query", () => {
    expect(ids(filterCommands(commands, "  "))).toEqual(ids(commands));
  });

  it("finds labels without their accents", () => {
    expect(ids(filterCommands(commands, "gestion"))).toEqual(["salon"]);
  });

  it("requires every word of the query", () => {
    expect(ids(filterCommands(commands, "salon caja"))).toEqual(["salon"]);
    expect(filterCommands(commands, "salon rust")).toEqual([]);
  });

  it("searches hints and keywords too", () => {
    expect(ids(filterCommands(commands, "rust"))).toEqual(["maderable"]);
    expect(ids(filterCommands(commands, "contact"))).toEqual(["email"]);
  });

  it("ranks the start of a label, then inside a label, then the rest", () => {
    // "Stack" starts with it, "Gestión" has it inside, Maderable only in a keyword.
    expect(ids(filterCommands(commands, "st"))).toEqual([
      "stack",
      "salon",
      "maderable",
    ]);
  });
});

describe("groupResults", () => {
  it("orders groups by their best result and numbers items in display order", () => {
    const results = filterCommands(commands, "st");
    const groups = groupResults(results);
    expect(groups.map((g) => g.group)).toEqual(["sections", "projects"]);
    expect(
      groups.flatMap((g) => g.items.map((i) => [i.command.id, i.index])),
    ).toEqual([
      ["stack", 0],
      ["salon", 1],
      ["maderable", 2],
    ]);
  });
});

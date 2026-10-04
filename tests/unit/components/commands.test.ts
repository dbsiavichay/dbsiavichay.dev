import { describe, expect, it } from "vitest";

import {
  commandWord,
  exNames,
  filterCommands,
  groupResults,
  normalize,
  runQuery,
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

describe("command mode", () => {
  const site: Command[] = [
    ...["work", "notes", "experience", "about", "contact"].map((id) =>
      command(`section-${id}`, "sections", id[0]!.toUpperCase() + id.slice(1)),
    ),
    command("colophon", "sections", "How this site is built"),
    command("locale", "actions", "Leer en español", {
      action: { type: "locale", locale: "es" },
    }),
    command("shortcuts", "actions", "Keyboard shortcuts", {
      action: { type: "help" },
    }),
  ];
  const labels = { quit: "Close this menu", sudo: "Permission granted." };
  const run = (query: string) => runQuery(site, query, labels);
  const names = (list: Command[]) => list.map((c) => c.label);

  it("starts at a colon", () => {
    expect(commandWord(":projects")).toBe("projects");
    expect(commandWord("  : q! ")).toBe("q!");
    expect(commandWord(":")).toBe("");
    expect(commandWord("projects")).toBeUndefined();
    expect(commandWord("sudo :q")).toBeUndefined();
  });

  it("lists the visible commands for a bare colon", () => {
    expect(names(run(":"))).toEqual(exNames);
    expect(exNames).toEqual([
      ":help",
      ":projects",
      ":notes",
      ":experience",
      ":about",
      ":contact",
      ":colophon",
      ":lang",
    ]);
  });

  it("completes a name and points at the command it runs", () => {
    const [projects, ...rest] = run(":pro");
    expect(rest).toEqual([]);
    expect(projects).toMatchObject({
      id: "ex-projects",
      group: "commands",
      label: ":projects",
      hint: "Work",
      action: { type: "navigate", href: "/en#section-work" },
    });
    expect(names(run(":c"))).toEqual([":contact", ":colophon"]);
    expect(run(":lang")[0]?.action).toEqual({ type: "locale", locale: "es" });
    expect(run(":help")[0]?.action).toEqual({ type: "help" });
  });

  it("answers hidden names only when typed whole", () => {
    expect(names(run(":work"))).toEqual([":work"]);
    expect(names(run(":wo"))).toEqual([]);
    for (const quit of [":q", ":q!", ":wq"]) {
      expect(run(quit), quit).toMatchObject([
        { label: quit, hint: "Close this menu", action: { type: "quit" } },
      ]);
    }
  });

  it("finds nothing for a name Vim wouldn't know", () => {
    expect(run(":nope")).toEqual([]);
    expect(run(":Q")).toEqual([]);
  });

  it("grants sudo, and otherwise searches", () => {
    expect(run("  SUDO  hire   Denis ")).toMatchObject([
      {
        id: "sudo",
        label: "Permission granted.",
        hint: "Contact",
        action: { type: "navigate", href: "/en#section-contact" },
      },
    ]);
    expect(ids(run("sudo"))).toEqual([]);
    expect(ids(run("built"))).toEqual(["colophon"]);
  });
});

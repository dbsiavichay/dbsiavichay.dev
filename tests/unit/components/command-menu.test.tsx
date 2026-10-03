import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { CommandMenu } from "@/components/command/command-menu";
import type { Command } from "@/components/command/commands";
import { setShortcutsEnabled } from "@/components/command/shortcuts";
import { en } from "@/i18n/dictionaries/en";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/en/projects/faclab",
}));

// jsdom has no <dialog> behaviour and no scrolling: open/close and the close
// event are enough here.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const commands: Command[] = [
  {
    id: "project-maderable",
    group: "projects",
    icon: "project",
    label: "Maderable",
    hint: "Quoting and cut optimization",
    action: { type: "navigate", href: "/en/projects/maderable" },
  },
  {
    id: "project-faclab",
    group: "projects",
    icon: "project",
    label: "Faclab",
    action: { type: "navigate", href: "/en/projects/faclab" },
  },
  {
    id: "locale",
    group: "actions",
    icon: "language",
    label: "Leer en español",
    action: { type: "locale", locale: "es" },
  },
];

function renderMenu(list = commands) {
  return render(
    <CommandMenu
      locale="en"
      commands={list}
      labels={en.command}
      shortcuts={en.shortcuts}
      copiedLabel={en.contact.copied}
    />,
  );
}

async function openWithShortcut(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Control>}k{/Control}");
  return screen.findByRole("combobox");
}

beforeEach(() => {
  push.mockClear();
  setShortcutsEnabled(true);
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("CommandMenu", () => {
  it("opens from the header button, with focus in the search", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Search the site" }));
    const input = await screen.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("opens with Ctrl+K and runs the active result with Enter", async () => {
    const user = userEvent.setup();
    renderMenu();
    const input = await openWithShortcut(user);
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: /Faclab/ }).id,
    );
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/en/projects/faclab");
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute(
      "open",
    );
  });

  it("filters as you type and says when nothing matches", async () => {
    const user = userEvent.setup();
    renderMenu();
    const input = await openWithShortcut(user);
    await user.type(input, "cut optim");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveAttribute("aria-selected", "true");

    await user.clear(input);
    await user.type(input, "kafka");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nothing matches “kafka”.", {
        selector: "[role=status]",
      }),
    ).toBeInTheDocument();
  });

  it("switches language on the same page", async () => {
    const user = userEvent.setup();
    renderMenu();
    const input = await openWithShortcut(user);
    await user.type(input, "español");
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/es/projects/faclab");
    expect(document.cookie).toContain("NEXT_LOCALE=es");
  });

  it("starts clean the next time it opens", async () => {
    const user = userEvent.setup();
    renderMenu();
    const input = await openWithShortcut(user);
    await user.type(input, "faclab");
    act(() => {
      screen.getByRole("dialog").dispatchEvent(new Event("close"));
    });
    await user.click(screen.getByRole("button", { name: "Search the site" }));
    expect(await screen.findByRole("combobox")).toHaveValue("");
  });
});

// The pages a few shortcuts and commands point to.
const site: Command[] = [
  ...commands,
  ...(["work", "contact"] as const).map((id): Command => ({
    id: `section-${id}`,
    group: "sections",
    icon: "section",
    label: id === "work" ? "Selected work" : "Contact",
    action: { type: "navigate", href: `/en#${id}` },
  })),
  {
    id: "shortcuts",
    group: "actions",
    icon: "keyboard",
    label: "Keyboard shortcuts",
    action: { type: "help" },
  },
];

/** Closes the open dialog the way Escape would, and leaves the page focused. */
function dismiss(name: string) {
  act(() => {
    screen.getByRole("dialog", { name }).dispatchEvent(new Event("close"));
    (document.activeElement as HTMLElement | null)?.blur();
  });
}

describe("keyboard shortcuts", () => {
  it("open the search with `/`, and in command mode with `:`", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    await user.keyboard("/");
    expect(await screen.findByRole("combobox")).toHaveValue("");
    dismiss("Search the site");

    await user.keyboard(":");
    const input = await screen.findByRole("combobox");
    expect(input).toHaveValue(":");
    // The commands this page can run, `:help` first.
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual([
      ":helpKeyboard shortcuts",
      ":projectsSelected work",
      ":contactContact",
      ":langLeer en español",
    ]);
    expect(screen.getByRole("option", { name: /:help/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("run what command mode names", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    await user.keyboard(":");
    const input = await screen.findByRole("combobox");
    await user.type(input, "pro{Enter}");
    expect(push).toHaveBeenCalledWith("/en#work");
  });

  it("answer an unknown command as Vim does", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    await user.keyboard(":");
    await user.type(await screen.findByRole("combobox"), "nope");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(
      screen.getByText("E492: Not an editor command: nope", { selector: "p" }),
    ).toBeVisible();
  });

  it("let you quit the menu with `:q`", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    await user.keyboard(":");
    await user.type(await screen.findByRole("combobox"), "q{Enter}");
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute(
      "open",
    );
    expect(
      screen.getByText("Closed. This one you can quit."),
    ).toBeInTheDocument();
  });

  it("grant `sudo hire denis` a way to Contact", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    await user.keyboard("/");
    await user.type(await screen.findByRole("combobox"), "sudo hire denis");
    expect(screen.getByRole("option")).toHaveTextContent(
      "Permission granted. Let's talk.",
    );
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/en#contact");
  });

  it("go to a part of the home with `g` and a letter", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderMenu();
    await user.keyboard("gp");
    expect(push).toHaveBeenLastCalledWith("/en#work");
    await user.keyboard("p");
    expect(push).toHaveBeenCalledTimes(1);
    // The tests run on /en: the home is already there, so it scrolls up.
    await user.keyboard("gh");
    expect(push).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("never fire while you type", async () => {
    const user = userEvent.setup();
    render(<input aria-label="Name" />);
    renderMenu();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "/gp?");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("can be turned off from the help, and back on from the footer", async () => {
    const user = userEvent.setup();
    render(
      <button type="button" data-shortcuts-help>
        Keyboard shortcuts
      </button>,
    );
    renderMenu();
    await user.keyboard("?");
    const help = await screen.findByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    const toggle = screen.getByRole("switch", { name: "Use these shortcuts" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    // jsdom isn't an Apple platform.
    expect(help).toHaveTextContent("Ctrl K and Esc work either way.");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(localStorage.getItem("shortcuts")).toBe("off");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(help).not.toHaveAttribute("open");

    await user.keyboard("/gp");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    );
    expect(help).toHaveAttribute("open");
    await user.click(toggle);
    expect(localStorage.getItem("shortcuts")).toBeNull();
  });

  it("open the help from ⌘K too", async () => {
    const user = userEvent.setup();
    renderMenu(site);
    const input = await openWithShortcut(user);
    await user.type(input, "keyboard{Enter}");
    expect(
      await screen.findByRole("dialog", { name: "Keyboard shortcuts" }),
    ).toHaveAttribute("open");
  });

  it("greet whoever opens the console", () => {
    renderMenu();
    expect(console.info).toHaveBeenCalledWith(en.shortcuts.greeting);
  });
});

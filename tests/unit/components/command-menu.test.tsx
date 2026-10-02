import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { CommandMenu } from "@/components/command/command-menu";
import type { Command } from "@/components/command/commands";
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

function renderMenu() {
  return render(
    <CommandMenu
      commands={commands}
      labels={en.command}
      copiedLabel={en.contact.copied}
    />,
  );
}

async function openWithShortcut(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Control>}k{/Control}");
  return screen.findByRole("combobox");
}

describe("CommandMenu", () => {
  beforeEach(() => {
    push.mockClear();
  });

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

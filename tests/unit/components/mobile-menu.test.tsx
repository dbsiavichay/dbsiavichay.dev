import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileMenu } from "@/components/navigation/mobile-menu";

const items = [
  { href: "/en#work", label: "Work" },
  { href: "/en#contact", label: "Contact" },
];

function renderMenu() {
  return render(
    <MobileMenu
      items={items}
      navLabel="Primary"
      openLabel="Open menu"
      closeLabel="Close menu"
    />,
  );
}

describe("MobileMenu", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  it("starts closed, with the panel hidden", () => {
    renderMenu();
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
  });

  it("opens and exposes the links", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeVisible();
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/en#work",
    );
  });

  it("closes on Escape and gives focus back to the toggle", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.tab();
    expect(screen.getByRole("link", { name: "Work" })).toHaveFocus();

    await user.keyboard("{Escape}");

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes after following a link", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: "Contact" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

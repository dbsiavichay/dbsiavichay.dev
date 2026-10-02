import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, ButtonLink } from "@/components/ui/button";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Copy</Button>);
    expect(screen.getByRole("button", { name: "Copy" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});

describe("ButtonLink", () => {
  it("renders internal paths as links", () => {
    render(<ButtonLink href="/en#work">See the work</ButtonLink>);
    expect(screen.getByRole("link", { name: "See the work" })).toHaveAttribute(
      "href",
      "/en#work",
    );
  });

  it("keeps external links in the same tab", () => {
    render(
      <ButtonLink href="https://github.com/dbsiavichay">GitHub</ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/dbsiavichay");
    expect(link).not.toHaveAttribute("target");
  });
});

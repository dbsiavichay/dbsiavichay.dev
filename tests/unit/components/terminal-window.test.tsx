import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Cursor,
  Prompt,
  TerminalWindow,
} from "@/components/terminal/terminal-window";

describe("TerminalWindow", () => {
  it("is named by the title it is given; the window chrome is decoration", () => {
    render(
      <TerminalWindow
        aria-labelledby="window-title"
        title={<h2 id="window-title">This build</h2>}
        status={<span>static</span>}
      >
        <p>output</p>
      </TerminalWindow>,
    );
    const window = screen.getByRole("region", { name: "This build" });
    expect(window).toHaveTextContent("output");
    expect(window).toHaveTextContent("static");
    // The three dots and the spacer that balances them.
    expect(window.querySelectorAll("[aria-hidden='true']")).toHaveLength(2);
  });
});

describe("Prompt", () => {
  it("keeps the command away from screen readers", () => {
    render(<Prompt command="build-info" />);
    expect(screen.getByText("build-info").closest("p")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("types the command one character per step, after a delay", () => {
    render(<Prompt command="build-info" typeAfter={650} />);
    const command = screen.getByText("build-info");
    expect(command.style.getPropertyValue("--chars")).toBe("10");
    expect(command.style.animationDelay).toBe("650ms");
  });

  it("leaves the command in place when it isn't typed", () => {
    render(<Prompt command="npm run test" />);
    expect(screen.getByText("npm run test")).not.toHaveAttribute("style");
  });
});

describe("Cursor", () => {
  it("only blinks when asked to, and from when it is asked to", () => {
    const { container, rerender } = render(<Cursor />);
    const cursor = container.firstElementChild as HTMLElement;
    expect(cursor).toHaveAttribute("aria-hidden", "true");
    expect(cursor).not.toHaveAttribute("style");

    rerender(<Cursor blinkAfter={1700} />);
    expect(cursor.style.animationDelay).toBe("1700ms");
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyEmailButton } from "@/components/home/copy-email-button";

function renderButton() {
  return render(
    <CopyEmailButton
      email="hello@example.com"
      label="Copy email"
      copiedLabel="Email copied"
    />,
  );
}

describe("CopyEmailButton", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies the address and announces it", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Copy email" }));

    expect(writeText).toHaveBeenCalledWith("hello@example.com");
    expect(screen.getByRole("status")).toHaveTextContent("Email copied");
  });

  it("clears the announcement after a moment", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Copy email" }));
    expect(screen.getByRole("status")).toHaveTextContent("Email copied");

    // Async so React's scheduler, also on fake timers, can run the effect
    // that starts the reset timer before the clock passes it.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("stays quiet when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    renderButton();

    await user.click(screen.getByRole("button", { name: "Copy email" }));

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});

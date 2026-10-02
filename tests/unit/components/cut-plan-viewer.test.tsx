import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  CutPlanViewer,
  type ViewerBoard,
  type ViewerItem,
} from "@/components/maderable/cut-plan-viewer";
import { billedAs, cutList, kerf, sheets, trim } from "@/data/cut-plan";
import { en } from "@/i18n/dictionaries/en";
import { derivePlan } from "@/lib/guillotine";

const specs = Object.fromEntries(cutList.map((item) => [item.mark, item]));
const boards: ViewerBoard[] = sheets.map((sheet) => ({
  kind: sheet.kind,
  plan: derivePlan({
    board: sheet.size,
    trim,
    kerf,
    layout: sheet.layout,
    pieces: specs,
  }),
}));
const items: ViewerItem[] = cutList.map((item) => ({
  ...item,
  part: item.part.en,
  board: boards.findIndex((b) =>
    b.plan.pieces.some((piece) => piece.mark === item.mark),
  ),
}));

function renderViewer() {
  render(
    <CutPlanViewer
      boards={boards}
      items={items}
      billedAs={billedAs.en}
      labels={en.cutPlan}
    />,
  );
  return {
    whole: screen.getByRole("button", { name: /^Board/ }),
    half: screen.getByRole("button", { name: /^Half board/ }),
    slider: screen.getByRole("slider", { name: "Cut sequence" }),
    status: () => screen.getByText(/cut|Cut/, { selector: "[aria-live]" }),
  };
}

describe("CutPlanViewer", () => {
  it("opens on the whole board with every cut made", () => {
    const { whole, half, slider, status } = renderViewer();
    expect(whole).toHaveAttribute("aria-pressed", "true");
    expect(half).toHaveAttribute("aria-pressed", "false");
    expect(slider).toHaveValue("9");
    expect(slider).toHaveAttribute("aria-valuetext", "Cut 9 of 9");
    expect(status()).toHaveTextContent("All 9 cuts made.");
  });

  it("steps back through the saw's sequence, naming what each cut frees", async () => {
    const user = userEvent.setup();
    const { status } = renderViewer();
    const previous = screen.getByRole("button", { name: "Previous cut" });
    await user.click(previous);
    expect(status()).toHaveTextContent("Cut 8 of 9 frees E.");
    for (let i = 0; i < 7; i++) await user.click(previous);
    expect(status()).toHaveTextContent("Cut 1 of 9 separates two strips.");
    await user.click(previous);
    expect(
      screen.getByText("Before the first cut: the board, trimmed square."),
    ).toBeInTheDocument();
    expect(previous).toBeDisabled();
  });

  it("keeps each board's place in the sequence", async () => {
    const user = userEvent.setup();
    const { whole, half, slider } = renderViewer();
    await user.click(screen.getByRole("button", { name: "Previous cut" }));
    await user.click(half);
    expect(slider).toHaveValue("4");
    await user.click(whole);
    expect(slider).toHaveValue("8");
  });

  it("shows a piece picked from the cut list on its own board", async () => {
    const user = userEvent.setup();
    const { half } = renderViewer();
    const pick = screen.getByRole("button", {
      name: "Show piece F on the plan",
    });
    await user.click(pick);
    expect(pick).toHaveAttribute("aria-pressed", "true");
    expect(half).toHaveAttribute("aria-pressed", "true");
    const row = pick.closest("tr")!;
    expect(within(row).getByText("no · rotated")).toBeInTheDocument();

    await user.click(pick);
    expect(pick).toHaveAttribute("aria-pressed", "false");
  });

  it("lists the banded edges in the shop's notation", () => {
    renderViewer();
    const door = screen
      .getByRole("button", { name: "Show piece D on the plan" })
      .closest("tr")!;
    expect(within(door).getByText("2L 2S")).toBeInTheDocument();
  });

  it("turns the grain and edge banding layers on and off", async () => {
    const user = userEvent.setup();
    renderViewer();
    const grain = screen.getByRole("checkbox", { name: "Grain" });
    expect(grain).toBeChecked();
    await user.click(grain);
    expect(grain).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Edge banding" }),
    ).toBeChecked();
  });
});

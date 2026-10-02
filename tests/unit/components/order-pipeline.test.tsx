import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  OrderPipeline,
  type PipelineStage,
} from "@/components/maderable/order-pipeline";
import { stages } from "@/data/order-pipeline";
import { es } from "@/i18n/dictionaries/es";

const localized: PipelineStage[] = stages.map((stage) => ({
  id: stage.id,
  state: stage.state,
  name: stage.name.es,
  actor: stage.actor.es,
  summary: stage.summary.es,
  rule: stage.rule.es,
  inventory: stage.inventory?.es,
  activities: stage.activities?.map((activity) => ({
    id: activity.id,
    name: activity.name.es,
    actor: activity.actor.es,
    rule: activity.rule.es,
  })),
}));

function renderPipeline() {
  render(<OrderPipeline stages={localized} labels={es.pipeline} />);
}

describe("the order pipeline data", () => {
  it("walks the quote's states and then the order's, in order", () => {
    expect(stages.map((stage) => stage.state)).toEqual([
      "draft",
      "sent",
      "confirmed",
      "queued",
      "in_process",
      "finished",
      "dispatched",
    ]);
  });

  it("reads the inventory only while quoting", () => {
    expect(
      stages.filter((stage) => stage.inventory).map((stage) => stage.id),
    ).toEqual(["quote"]);
  });
});

describe("OrderPipeline", () => {
  it("shows one stage at a time, starting with the quote", () => {
    renderPipeline();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Cotización");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("draft");
  });

  it("moves between stages with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    renderPipeline();
    const tabs = screen.getAllByRole("tab");
    await user.click(tabs[0]!);
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("sent");

    await user.keyboard("{End}");
    expect(tabs[6]).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("dispatched");

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("keeps only the selected tab in the tab order", async () => {
    const user = userEvent.setup();
    renderPipeline();
    await user.click(screen.getByRole("tab", { name: "Taller" }));
    const tabbable = screen
      .getAllByRole("tab")
      .filter((tab) => tab.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("Taller");
  });

  it("shows the workshop's parallel activities", async () => {
    const user = userEvent.setup();
    renderPipeline();
    await user.click(screen.getByRole("tab", { name: "Taller" }));
    const panel = screen.getByRole("tabpanel");
    for (const name of ["Corte", "Canteado", "Trabajos adicionales"]) {
      expect(panel).toHaveTextContent(name);
    }
  });

  it("steps with the previous and next buttons", async () => {
    const user = userEvent.setup();
    renderPipeline();
    const previous = screen.getByRole("button", { name: "Etapa anterior" });
    const next = screen.getByRole("button", { name: "Etapa siguiente" });
    expect(previous).toBeDisabled();
    await user.click(next);
    await user.click(next);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("confirmed");
    expect(screen.getByText("Etapa 3 de 7")).toBeInTheDocument();
  });
});

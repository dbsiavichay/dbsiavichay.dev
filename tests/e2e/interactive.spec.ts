import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** A string only React Flow's code contains. */
const REACT_FLOW = "react-flow__pane";

/** Collects the scripts a page downloads, to tell which libraries loaded. */
function recordScripts(page: Page) {
  const bodies: Promise<string>[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "script") {
      bodies.push(response.text().catch(() => ""));
    }
  });
  return async () => (await Promise.all(bodies)).join("\n");
}

test.describe("command menu", () => {
  test("⌘K finds a case study and goes there", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Keyboard shortcut.");
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("ControlOrMeta+k");
    const search = page.getByRole("combobox", { name: "Search the site" });
    await expect(search).toBeFocused();

    await search.fill("vertical slices");
    await expect(page.getByRole("option")).toHaveCount(0);
    await search.fill("cut optimization");
    await expect(page.getByRole("option").first()).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/projects\/maderable$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("the search button opens it, and Escape gives focus back", async ({
    page,
  }) => {
    await page.goto("/es");
    const button = page.getByRole("button", { name: "Buscar en el sitio" });
    const dialog = page.getByRole("dialog", { name: "Buscar en el sitio" });
    await expect(async () => {
      await button.click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass();
    await expect(page.getByRole("combobox")).toBeFocused();

    const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(results.violations).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("an action can switch the language of the current page", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Keyboard shortcut.");
    await page.goto("/es/notes/rules-that-cant-be-bypassed");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("ControlOrMeta+k");
    await page.getByRole("combobox").fill("english");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/notes\/rules-that-cant-be-bypassed$/);
  });
});

test.describe("interactive figures", () => {
  test("the home never downloads React Flow", async ({ page }) => {
    const scripts = recordScripts(page);
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    expect(await scripts()).not.toContain(REACT_FLOW);
  });

  test("the cut plan steps through the saw's sequence", async ({ page }) => {
    await page.goto("/en/projects/maderable");
    const plan = page.locator("figure", { hasText: "Cut plan" });
    const status = plan.locator("[aria-live]");
    await expect(status).toHaveText("All 9 cuts made.");
    await expect(async () => {
      await plan.getByRole("button", { name: "Previous cut" }).click();
      await expect(status).toHaveText("Cut 8 of 9 frees E.", { timeout: 500 });
    }).toPass();

    await plan
      .getByRole("button", { name: "Show piece B on the plan" })
      .click();
    await expect(
      plan.getByRole("button", { name: /^Half board/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(plan.getByRole("slider")).toHaveValue("4");
  });

  test("the order pipeline moves stage by stage", async ({ page }) => {
    await page.goto("/es/projects/maderable");
    const pipeline = page.locator("figure", {
      hasText: "De la cotización al despacho",
    });
    const panel = pipeline.getByRole("tabpanel");
    await expect(panel).toContainText("draft");
    await expect(async () => {
      await pipeline.getByRole("tab", { name: "Taller" }).click();
      await expect(panel).toContainText("in_process", { timeout: 500 });
    }).toPass();
    await expect(panel).toContainText("Canteado");
  });

  test("an architecture diagram loads React Flow only when explored", async ({
    page,
  }) => {
    const scripts = recordScripts(page);
    await page.goto("/en/projects/maderable");
    await page.waitForLoadState("networkidle");
    expect(await scripts()).not.toContain(REACT_FLOW);

    const figure = page.locator("figure", {
      hasText: "Maderable · runtime architecture",
    });
    await expect(figure.getByRole("img")).toHaveAccessibleName(
      "Maderable · runtime architecture",
    );
    await figure.getByRole("button", { name: /Explore/ }).click();
    const canvas = figure.getByRole("application", {
      name: "Interactive diagram",
    });
    await expect(canvas).toBeVisible();

    const api = canvas.getByRole("group", { name: "API, FastAPI · slices" });
    await api.focus();
    await page.keyboard.press("Enter");
    await expect(figure.locator('[aria-live="polite"]')).toContainText(
      "FastAPI organized in vertical slices",
    );

    const results = await new AxeBuilder({ page })
      .include("figure")
      .withTags(axeTags)
      .analyze();
    expect(results.violations).toEqual([]);

    await figure.getByRole("button", { name: "Back to the drawing" }).click();
    await expect(canvas).toBeHidden();
    await expect(figure.getByRole("img")).toBeVisible();
  });

  test("the Faclab diagram switches between its two shapes", async ({
    page,
  }) => {
    await page.goto("/es/projects/faclab");
    const figure = page.locator("figure", { hasText: "Faclab ·" });
    const drawing = figure.getByRole("img");
    await expect(drawing).toHaveAccessibleName(/2025/);
    await expect(async () => {
      await figure.getByRole("button", { name: /^2026/ }).click();
      await expect(drawing).toHaveAccessibleName(/2026/, { timeout: 500 });
    }).toPass();
    await expect(figure.getByRole("button", { name: /^2026/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await figure.getByText("Componentes y conexiones").click();
    await expect(figure).toContainText("sales.confirmed → Facturación");
  });
});

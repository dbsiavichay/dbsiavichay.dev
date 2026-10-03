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

test.describe("keyboard shortcuts", () => {
  test.skip(({ isMobile }) => isMobile, "Keyboard shortcuts.");

  /** Where a section's top sits, relative to the viewport. */
  const top = (page: Page, selector: string) =>
    page.evaluate(
      (s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top),
      selector,
    );

  test("`g` and a letter go to the home, `j` and `k` move between sections", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/colophon");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("g");
    await page.keyboard.press("p");
    await expect(page).toHaveURL(/\/en#work$/);
    // A section stops at the scroll padding, under the sticky header.
    await expect.poll(() => top(page, "#work")).toBe(80);

    await page.keyboard.press("j");
    await expect.poll(() => top(page, "#notes")).toBe(80);
    await page.keyboard.press("k");
    await page.keyboard.press("k");
    await expect.poll(() => top(page, "#capabilities")).toBe(80);
    await page.keyboard.press("k");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });

  test("`j` follows an article's sections", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/projects/maderable");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("j");
    await page.keyboard.press("j");
    const second = await page.evaluate(
      () => document.querySelectorAll(".prose h2[id]")[1]!.id,
    );
    await expect.poll(() => top(page, `#${second}`)).toBe(80);
    await expect(
      page.locator(`[data-toc] a[href="#${second}"]`).first(),
    ).toHaveAttribute("aria-current", "location");
  });

  test("`:` opens command mode, which answers like Vim", async ({ page }) => {
    await page.goto("/es");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press(":");
    const search = page.getByRole("combobox", { name: "Buscar en el sitio" });
    await expect(search).toHaveValue(":");
    await expect(page.getByRole("option").first()).toHaveText(
      /^:helpAtajos de teclado/,
    );

    await search.fill(":nada");
    await expect(
      page.getByText("E492: No es una orden del editor: nada", { exact: true }),
    ).toBeVisible();
    await search.fill(":colophon");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/es\/colophon$/);
  });

  test("the help turns the keys off, and the footer brings it back", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("?");
    const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(help).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(results.violations).toEqual([]);

    const toggle = help.getByRole("switch", { name: "Use these shortcuts" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Escape");
    await expect(help).toBeHidden();

    // Remembered after a reload: `?` does nothing now.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("?");
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page
      .getByRole("contentinfo")
      .getByRole("button", { name: "Keyboard shortcuts" })
      .click();
    await expect(help).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("/");
    await expect(
      page.getByRole("combobox", { name: "Search the site" }),
    ).toBeFocused();
  });

  test("the console says hello", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "info") messages.push(message.text());
    });
    await page.goto("/en");
    await expect
      .poll(() => messages.join("\n"))
      .toContain("https://github.com/dbsiavichay/dbsiavichay.dev");
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

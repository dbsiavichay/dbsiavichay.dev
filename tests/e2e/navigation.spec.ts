import { expect, test } from "@playwright/test";

test.describe("keyboard navigation", () => {
  test("the first Tab reveals a skip link that moves focus to the content", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Keyboard flow is a desktop concern.",
    );

    await page.goto("/en");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("focused links show a visible outline", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Keyboard flow is a desktop concern.",
    );

    await page.goto("/en");
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // home link
    const home = page.getByRole("link", { name: "Denis Siavichay, home" });
    await expect(home).toBeFocused();
    const outline = await home.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).toBe("solid");
  });
});

test.describe("header", () => {
  test("desktop shows the inline navigation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile");
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Experience" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });

  test("mobile opens the menu, and Escape closes it", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile");
    await page.goto("/es");

    const toggle = page.getByRole("button", { name: "Abrir menú" });
    await toggle.click();
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav.getByRole("link", { name: "Experiencia" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Abrir menú" }),
    ).toBeFocused();
  });
});

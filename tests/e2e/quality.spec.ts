import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/en", "/es", "/en/not-a-page"];

test.describe("accessibility", () => {
  for (const route of routes) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("respects reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
  });
});

// The widths the brief asks to check. Composition is reviewed on the
// screenshots; the hard rule enforced here is "no horizontal scrolling".
const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920];

test.describe("responsive layout", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Widths are set explicitly on the desktop project.",
  );

  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      for (const locale of ["en", "es"]) {
        await page.goto(`/${locale}`);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, `/${locale} at ${width}px`).toBeLessThanOrEqual(0);
        await testInfo.attach(`${locale}-${width}.png`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      }
    });
  }
});

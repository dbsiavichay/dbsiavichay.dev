import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/en",
  "/es",
  "/en/projects/maderable",
  "/es/projects/salon",
  "/en/notes/following-a-request-across-kafka",
  "/es/notes/rules-that-cant-be-bypassed",
  "/en/not-a-page",
];

test.describe("accessibility", () => {
  for (const route of routes) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      // Audit the settled page, not a frame of the entrance animation: a
      // half-faded button reads as low contrast. Scroll-driven animations
      // never finish, and only move content, so they are left alone.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.timeline === document.timeline)
            .map((animation) => animation.finished),
        ),
      );
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

// The home in both languages, and one page of each long-form kind.
const layoutPaths = [
  "/en",
  "/es",
  "/en/projects/maderable",
  "/es/notes/monolith-to-services-and-back",
];

test.describe("responsive layout", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Widths are set explicitly on the desktop project.",
  );

  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of layoutPaths) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
        await testInfo.attach(
          `${path.slice(1).replaceAll("/", "-")}-${width}.png`,
          {
            body: await page.screenshot({ fullPage: true }),
            contentType: "image/png",
          },
        );
      }
    });
  }
});

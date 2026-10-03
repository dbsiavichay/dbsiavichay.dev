import { expect, test } from "@playwright/test";

test.describe("language routing", () => {
  test("/ redirects to English by default", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/\/en$/);
  });

  test("/ follows the browser language", async ({ request }) => {
    const response = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "es-EC,es;q=0.9,en;q=0.8" },
    });
    expect(response.headers().location).toMatch(/\/es$/);
  });

  test("an explicit choice beats the browser language", async ({ request }) => {
    const response = await request.get("/", {
      maxRedirects: 0,
      headers: { "Accept-Language": "en-US", Cookie: "NEXT_LOCALE=es" },
    });
    expect(response.headers().location).toMatch(/\/es$/);
  });

  test("the health check is not redirected to a locale", async ({
    request,
  }) => {
    const response = await request.get("/healthz", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok" });
  });

  test("each locale sets the document language", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("the switcher keeps the page and remembers the choice", async ({
    page,
    context,
  }) => {
    await page.goto("/en");
    await page
      .getByRole("group", { name: "Language" })
      .getByRole("link", { name: "Español" })
      .click();
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "NEXT_LOCALE")?.value).toBe(
      "es",
    );
  });
});

test.describe("not found", () => {
  test("unknown pages answer 404 with the localized page", async ({ page }) => {
    const response = await page.goto("/es/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Esta página no existe.",
    );
    await expect(
      page.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/es");
  });

  test("the style guide is not published", async ({ request }) => {
    const response = await request.get("/en/design-system");
    expect(response.status()).toBe(404);
  });
});

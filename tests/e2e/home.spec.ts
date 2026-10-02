import { expect, test } from "@playwright/test";

// Built from parts so this file isn't listed by `npm run content:pending`.
const PENDING_MARKER = ["TODO", "CONFIRM WITH DENIS"].join(": ");

const sections = {
  en: [
    "Software for the way a business actually operates.",
    "Four systems, four different lessons.",
    "The technical stories behind the decisions.",
    "From understanding the business to improving what's running.",
    "Building software since 2013.",
    "Tools, and where I've used them.",
    "Understand the business, then build.",
    "Let's build something useful.",
  ],
  es: [
    "Software para la forma en que opera un negocio de verdad.",
    "Cuatro sistemas, cuatro lecciones distintas.",
    "Las historias técnicas detrás de las decisiones.",
    "De entender el negocio a mejorar lo que ya está en producción.",
    "Construyendo software desde 2013.",
    "Herramientas, y dónde las he usado.",
    "Entender el negocio, después construir.",
    "Construyamos algo útil.",
  ],
};

test.describe("home", () => {
  for (const [locale, titles] of Object.entries(sections)) {
    test(`/${locale} renders every section in order`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const sectionTitles = await page
        .locator("main section[id] h2")
        .allTextContents();
      expect(sectionTitles).toEqual(titles);
    });
  }

  test("every navbar anchor lands on a section of the page", async ({
    page,
  }) => {
    await page.goto("/en");
    const hrefs = await page
      .locator("header nav a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const id = href?.split("#")[1];
      expect(id, href ?? "").toBeTruthy();
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("publishes no unconfirmed fact", async ({ page }) => {
    for (const locale of ["en", "es"]) {
      await page.goto(`/${locale}`);
      await expect(page.locator("body")).not.toContainText(PENDING_MARKER);
    }
  });

  test("the build panel describes this build", async ({ page }) => {
    await page.goto("/en");
    const panel = page.getByRole("region", { name: "This build" });
    await expect(panel).toContainText(/Next\.js \d+\.\d+\.\d+/);
    await expect(panel).toContainText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/);
  });

  test("project cards link to their case studies", async ({ page }) => {
    await page.goto("/es");
    const work = page.locator("#work");
    await expect(
      work.getByRole("link", { name: "Maderable", exact: true }),
    ).toHaveAttribute("href", "/es/projects/maderable");
    await expect(work.getByRole("article")).toHaveCount(4);
  });

  test("the email can be copied", async ({ page, context }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Clipboard permissions are granted on desktop Chromium.",
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/en");
    const contact = page.locator("#contact");
    await contact.getByRole("button", { name: "Copy email" }).click();
    await expect(contact.getByRole("status")).toHaveText(
      "Email copied to the clipboard",
    );
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/^[^@\s]+@[^@\s]+$/);
  });
});

test.describe("metadata", () => {
  test("canonical and hreflang point at each language", async ({ page }) => {
    await page.goto("/es");
    const href = (selector: string) =>
      page.locator(selector).getAttribute("href");
    expect(await href('link[rel="canonical"]')).toMatch(/\/es$/);
    expect(await href('link[rel="alternate"][hreflang="en"]')).toMatch(/\/en$/);
    expect(await href('link[rel="alternate"][hreflang="x-default"]')).toMatch(
      /^https?:\/\/[^/]+\/?$/,
    );
  });

  test("Open Graph has a title, a locale and a rendered image", async ({
    page,
    request,
  }) => {
    await page.goto("/en");
    const content = (property: string) =>
      page.locator(`meta[property="${property}"]`).getAttribute("content");
    expect(await content("og:title")).toBe(
      "Denis Siavichay — Software Engineer",
    );
    expect(await content("og:locale")).toBe("en_US");

    const image = await content("og:image");
    expect(image).toBeTruthy();
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("JSON-LD describes the person behind the page", async ({ page }) => {
    await page.goto("/en");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(raw ?? "{}") as {
      "@graph": { "@type": string; name?: string }[];
    };
    const types = data["@graph"].map((node) => node["@type"]);
    expect(types).toEqual(["Person", "WebSite", "ProfilePage"]);
    expect(data["@graph"][0]?.name).toBe("Denis Siavichay");
  });

  test("sitemap and robots are published", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("/en</loc>");
    expect(xml).toContain("/es</loc>");

    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap:");
  });
});

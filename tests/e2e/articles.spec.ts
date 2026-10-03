import { expect, test } from "@playwright/test";

// Built from parts so this file isn't listed by `npm run content:pending`.
const PENDING_MARKER = ["TODO", "CONFIRM WITH DENIS"].join(": ");

const projects = ["maderable", "faclab", "salon", "sim"];
const notes = [
  "optimize-for-the-invoice",
  "monolith-to-services-and-back",
  "rules-that-cant-be-bypassed",
  "following-a-request-across-kafka",
  "deleting-the-architecture-you-didnt-need",
];
const paths = [
  ...projects.map((slug) => `/projects/${slug}`),
  ...notes.map((slug) => `/notes/${slug}`),
  "/colophon",
];

test.describe("case studies, notes and the colophon", () => {
  for (const locale of ["en", "es"]) {
    for (const path of paths) {
      test(`/${locale}${path} renders its article`, async ({ page }) => {
        const response = await page.goto(`/${locale}${path}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        expect(
          await page.locator("main article .prose h2[id]").count(),
        ).toBeGreaterThanOrEqual(3);
        await expect(page.locator("body")).not.toContainText(PENDING_MARKER);
      });
    }
  }

  test("every contents link lands on its section", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "The sticky contents are a desktop layout.",
    );
    for (const path of [
      "/en/projects/maderable",
      "/es/notes/rules-that-cant-be-bypassed",
    ]) {
      await page.goto(path);
      const toc = page.locator('nav[aria-labelledby="toc-title"]');
      await expect(toc).toBeVisible();
      const hrefs = await toc
        .locator("a")
        .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
      expect(hrefs.length).toBeGreaterThanOrEqual(3);
      for (const href of hrefs) {
        await expect(page.locator(`h2${href}`), href ?? "").toHaveCount(1);
      }
    }
  });

  test("the contents follow the section being read", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "The sticky contents are a desktop layout.",
    );
    await page.goto("/en/projects/maderable");
    const toc = page.locator('nav[aria-labelledby="toc-title"]');
    const current = toc.locator('[aria-current="location"]');
    const ruler = toc.locator('p[aria-hidden="true"]');
    await expect(current).toHaveCount(0);
    await expect(ruler).toHaveText("NORMALTop");

    const links = toc.getByRole("link");
    const total = String(await links.count()).padStart(2, "0");
    await links.nth(1).click();
    await expect(links.nth(1)).toHaveAttribute("aria-current", "location");
    await expect(current).toHaveCount(1);
    await expect(ruler).toHaveText(`NORMAL02/${total}`);
  });

  test("the contents fold above the text on a phone", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile");
    await page.goto("/es/projects/faclab");
    const contents = page.getByRole("navigation", { name: "En esta página" });
    await expect(contents).toBeHidden();
    await page.locator("summary", { hasText: "En esta página" }).click();
    await expect(contents).toBeVisible();
    const first = contents.getByRole("link").first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("a card on the home leads to its case study", async ({ page }) => {
    await page.goto("/en");
    await page
      .locator("#work")
      .getByRole("link", { name: "Maderable", exact: true })
      .click();
    await expect(page).toHaveURL(/\/en\/projects\/maderable$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Maderable",
    );
  });

  test("a case study leads to its notes and to the next one", async ({
    page,
  }) => {
    await page.goto("/en/projects/maderable");
    const related = page.getByRole("region", {
      name: "Notes from this project",
    });
    await expect(
      related.getByRole("link", {
        name: "Optimize for the invoice, not the layout",
      }),
    ).toHaveAttribute("href", "/en/notes/optimize-for-the-invoice");
    await page.getByRole("link", { name: "Faclab", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/projects\/faclab$/);
  });

  test("a note links back to the case studies it comes from", async ({
    page,
  }) => {
    await page.goto("/es/notes/rules-that-cant-be-bypassed");
    const sources = page.getByRole("region", {
      name: "Los case studies detrás de esta nota",
    });
    await expect(sources.getByRole("link")).toHaveCount(3);
    await expect(sources.getByRole("link", { name: "Grazia" })).toHaveAttribute(
      "href",
      "/es/projects/salon",
    );
  });

  test("the language switch keeps the article", async ({ page }) => {
    await page.goto("/en/projects/salon");
    await page
      .getByRole("group", { name: "Language" })
      .getByRole("link", { name: "Español" })
      .click();
    await expect(page).toHaveURL(/\/es\/projects\/salon$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // The product's name is the same in both languages; its tagline isn't.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grazia");
    await expect(
      page.getByText("Agenda, pagos y caja para un salón de belleza"),
    ).toBeVisible();
  });

  test("unknown slugs answer 404 in the route's language", async ({ page }) => {
    for (const [path, title] of [
      ["/es/projects/no-existe", "Esta página no existe."],
      ["/en/notes/not-a-note", "This page doesn't exist."],
    ] as const) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
  });
});

test.describe("article metadata", () => {
  test("canonical, hreflang and Open Graph describe the article", async ({
    page,
    request,
  }) => {
    await page.goto("/es/notes/monolith-to-services-and-back");
    const attr = (selector: string, name: string) =>
      page.locator(selector).getAttribute(name);
    expect(await attr('link[rel="canonical"]', "href")).toMatch(
      /\/es\/notes\/monolith-to-services-and-back$/,
    );
    expect(await attr('link[rel="alternate"][hreflang="en"]', "href")).toMatch(
      /\/en\/notes\/monolith-to-services-and-back$/,
    );
    expect(await attr('meta[property="og:type"]', "content")).toBe("article");
    expect(await attr('meta[property="og:locale"]', "content")).toBe("es_EC");

    const image = await attr('meta[property="og:image"]', "content");
    expect(image).toMatch(
      /\/es\/notes\/monolith-to-services-and-back\/opengraph-image/,
    );
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("JSON-LD describes the article and its author", async ({ page }) => {
    await page.goto("/en/projects/faclab");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(raw ?? "{}") as {
      "@graph": { "@type": string; headline?: string; author?: unknown }[];
    };
    const [article, breadcrumb] = data["@graph"];
    expect(article).toMatchObject({
      "@type": "TechArticle",
      headline: "Faclab",
      author: { name: "Denis Siavichay" },
    });
    expect(breadcrumb?.["@type"]).toBe("BreadcrumbList");
  });

  test("the sitemap lists every article in both languages", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const locale of ["en", "es"]) {
      for (const path of paths) {
        expect(xml).toContain(`/${locale}${path}</loc>`);
      }
    }
  });
});

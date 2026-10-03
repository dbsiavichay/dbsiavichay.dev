import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { MDXComponents, MDXContent } from "mdx/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { navSections } from "@/components/navigation/nav-items";
import { diagrams } from "@/data/diagrams";
import { locales, type Locale } from "@/i18n/config";
import {
  contentKinds,
  contentPath,
  getSlugs,
  type ContentKind,
} from "@/lib/content";
import { extractBody, extractHeadings } from "@/lib/mdx-source";
// Aliased: despite its name it is a plain function, not a hook.
import { useMDXComponents as mdxComponents } from "@/mdx-components";

// These figures read the locale from the route, which only exists inside
// Next. Their content is tested on its own.
vi.mock("@/components/mdx/architecture-diagram", () => ({
  ArchitectureDiagram: () => null,
}));
vi.mock("@/components/mdx/cut-plan", () => ({ CutPlan: () => null }));
vi.mock("@/components/mdx/order-pipeline", () => ({
  OrderPipeline: () => null,
}));

const root = path.join(process.cwd(), "src", "content");

const entries = contentKinds.flatMap((kind) =>
  getSlugs(kind).map((slug) => ({ kind, slug })),
);

/** Every page a body may link to, without its language: "/projects/sim". */
const routes = entries.map(({ kind, slug }) => contentPath(kind, slug));

/** Links into this site's own repository, on its default branch. */
const SOURCE_LINK =
  /\]\(https:\/\/github\.com\/dbsiavichay\/dbsiavichay\.dev\/blob\/master\/([^)\s#]+)\)/g;

function sourceOf(kind: ContentKind, slug: string, locale: Locale) {
  return readFileSync(path.join(root, kind, slug, `${locale}.mdx`), "utf8");
}

async function render(kind: ContentKind, slug: string, locale: Locale) {
  const mod = (await import(`@/content/${kind}/${slug}/${locale}.mdx`)) as {
    default: MDXContent;
  };
  const Content = mod.default;
  const components: MDXComponents = mdxComponents();
  return renderToStaticMarkup(<Content components={components} />);
}

describe.each(entries)("$kind/$slug", ({ kind, slug }) => {
  const headings = Object.fromEntries(
    locales.map((l) => [l, extractHeadings(sourceOf(kind, slug, l))]),
  ) as Record<Locale, ReturnType<typeof extractHeadings>>;

  it("has a body with sections", () => {
    for (const locale of locales) {
      expect(headings[locale].length, locale).toBeGreaterThanOrEqual(3);
    }
  });

  it("has the same structure in every language", () => {
    const [reference, ...others] = locales.map((l) => headings[l].length);
    for (const count of others) expect(count).toBe(reference);
  });

  it("gives every section a unique id", () => {
    for (const locale of locales) {
      const ids = headings[locale].map((h) => h.id);
      expect(ids.every(Boolean)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it.each(locales)(
    "renders %s with the ids its table of contents links to",
    async (locale) => {
      const html = await render(kind, slug, locale);
      const rendered = [...html.matchAll(/<h2 id="([^"]+)"/g)].map(
        ([, id]) => id,
      );
      expect(rendered).toEqual(headings[locale].map((h) => h.id));
    },
  );

  it.each(locales)("links only to pages that exist, in %s", (locale) => {
    const body = extractBody(sourceOf(kind, slug, locale));
    const links = [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map(
      ([, href]) => href!,
    );
    for (const href of links) {
      const [pathname = "", anchor] = href.split("#");
      const [, lang, ...rest] = pathname.split("/");
      expect(lang, href).toBe(locale);
      if (rest.length === 0) {
        if (anchor) expect(navSections, href).toContain(anchor);
        continue;
      }
      expect(routes, href).toContain(`/${rest.join("/")}`);
    }
  });

  it("links only to files that exist in this repository", () => {
    for (const locale of locales) {
      const body = extractBody(sourceOf(kind, slug, locale));
      for (const [, file] of body.matchAll(SOURCE_LINK)) {
        expect(existsSync(path.join(process.cwd(), file!)), file).toBe(true);
      }
    }
  });

  it("names only diagrams that exist", () => {
    for (const locale of locales) {
      const body = extractBody(sourceOf(kind, slug, locale));
      for (const [, name] of body.matchAll(
        /<ArchitectureDiagram name="([^"]+)"/g,
      )) {
        expect(Object.keys(diagrams), `${locale}.mdx`).toContain(name);
      }
    }
  });

  it("only uses the components MDX provides", () => {
    const provided = Object.keys(mdxComponents());
    for (const locale of locales) {
      const body = extractBody(sourceOf(kind, slug, locale));
      for (const [, name] of body.matchAll(/<([A-Z]\w*)/g)) {
        expect(provided, `<${name}> in ${locale}.mdx`).toContain(name);
      }
    }
  });
});

import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  alternates,
  localePath,
  openGraph,
  profileJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

describe("seo", () => {
  it("builds paths inside a locale", () => {
    expect(localePath("en")).toBe("/en");
    expect(localePath("es", "/projects/maderable")).toBe(
      "/es/projects/maderable",
    );
    expect(absoluteUrl("/es", "https://example.com")).toBe(
      "https://example.com/es",
    );
  });

  it("points canonical at the page's own language and lists every other", () => {
    expect(alternates("es", "/notes/x")).toEqual({
      canonical: "/es/notes/x",
      languages: {
        en: "/en/notes/x",
        es: "/es/notes/x",
        "x-default": "/notes/x",
      },
    });
  });

  it("sends x-default for the home to the negotiating root", () => {
    expect(alternates("en").languages).toMatchObject({ "x-default": "/" });
  });

  it("describes the page for Open Graph in its language", () => {
    const og = openGraph("es", { title: "T", description: "D" });
    expect(og).toMatchObject({
      url: "/es",
      locale: "es_EC",
      alternateLocale: ["en_US"],
      title: "T",
      description: "D",
    });
  });

  it("links the person, the site and the profile page", () => {
    const data = profileJsonLd("en", { title: "T", description: "D" });
    const graph = data["@graph"];
    const person = graph.find((node) => node["@type"] === "Person");
    const page = graph.find((node) => node["@type"] === "ProfilePage");
    expect(person).toMatchObject({ name: "Denis Siavichay" });
    expect(page).toMatchObject({
      inLanguage: "en",
      mainEntity: { "@id": person?.["@id"] },
    });
  });

  it("escapes markup so JSON-LD can't close its script tag", () => {
    const json = serializeJsonLd({ text: "</script><script>alert(1)" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ text: "</script><script>alert(1)" });
  });
});

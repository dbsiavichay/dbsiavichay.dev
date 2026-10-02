import { describe, expect, it } from "vitest";

import { negotiateLocale } from "@/i18n/negotiate";

describe("negotiateLocale", () => {
  it("falls back to English without any signal", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
  });

  it("matches on the primary subtag, whatever the region", () => {
    expect(negotiateLocale("es-EC")).toBe("es");
    expect(negotiateLocale("es-MX,es;q=0.9")).toBe("es");
    expect(negotiateLocale("en-GB")).toBe("en");
  });

  it("respects quality values, not just order", () => {
    expect(negotiateLocale("en;q=0.4,es;q=0.9")).toBe("es");
    expect(negotiateLocale("es;q=0.5,en;q=0.8")).toBe("en");
  });

  it("skips languages the site does not offer", () => {
    expect(negotiateLocale("fr-FR,de;q=0.9,es;q=0.5")).toBe("es");
    expect(negotiateLocale("pt-BR,fr;q=0.8")).toBe("en");
  });

  it("ignores languages explicitly refused with q=0", () => {
    expect(negotiateLocale("es;q=0,en;q=0.1")).toBe("en");
  });

  it("treats a wildcard as the default", () => {
    expect(negotiateLocale("*")).toBe("en");
  });

  it("lets the cookie from the language switcher win", () => {
    expect(negotiateLocale("en-US,en;q=0.9", "es")).toBe("es");
  });

  it("ignores a cookie with an unknown locale", () => {
    expect(negotiateLocale("es", "fr")).toBe("es");
  });
});

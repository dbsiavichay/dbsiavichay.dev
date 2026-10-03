import { describe, expect, it } from "vitest";

import { cn, isExternalHref } from "@/lib/utils";

describe("cn", () => {
  it("lets later utilities override earlier ones", () => {
    expect(cn("px-4 text-fg", "px-6")).toBe("text-fg px-6");
  });

  it.each(["text-display", "text-lede"])(
    "keeps the custom size %s next to a colour utility",
    (size) => {
      expect(cn(size, "text-fg")).toBe(`${size} text-fg`);
    },
  );

  it("skips falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("isExternalHref", () => {
  it.each([
    ["https://github.com/dbsiavichay", true],
    ["mailto:someone@example.com", true],
    ["//cdn.example.com/x", true],
    ["/en/projects/maderable", false],
    ["#contact", false],
  ])("%s → %s", (href, expected) => {
    expect(isExternalHref(href)).toBe(expected);
  });
});

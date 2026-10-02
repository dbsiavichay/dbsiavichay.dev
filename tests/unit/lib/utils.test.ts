import { describe, expect, it } from "vitest";

import { cn, isExternalHref } from "@/lib/utils";

describe("cn", () => {
  it("lets later utilities override earlier ones", () => {
    expect(cn("px-4 text-fg", "px-6")).toBe("text-fg px-6");
  });

  it("keeps the custom display size next to a colour utility", () => {
    expect(cn("text-display", "text-fg")).toBe("text-display text-fg");
  });

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

import { describe, expect, it } from "vitest";

import { localizedPath } from "@/i18n/paths";

describe("localizedPath", () => {
  it("swaps the locale of the home page", () => {
    expect(localizedPath("/en", "es")).toBe("/es");
  });

  it("keeps the rest of the path", () => {
    expect(localizedPath("/en/projects/maderable", "es")).toBe(
      "/es/projects/maderable",
    );
    expect(localizedPath("/es/notes/a/b", "en")).toBe("/en/notes/a/b");
  });

  it("tolerates a trailing slash", () => {
    expect(localizedPath("/en/", "es")).toBe("/es");
  });
});

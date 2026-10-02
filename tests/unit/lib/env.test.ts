import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("has safe defaults for local development", () => {
    expect(parseEnv({})).toEqual({
      SITE_URL: "https://dbsiavichay.dev",
      BUILD_SHA: "dev",
    });
  });

  it("treats empty build args as not provided", () => {
    expect(
      parseEnv({ SITE_URL: "", BUILD_SHA: "", BUILD_TIME: "" }).SITE_URL,
    ).toBe("https://dbsiavichay.dev");
  });

  it("drops trailing slashes from the site URL", () => {
    expect(parseEnv({ SITE_URL: "https://example.com/" }).SITE_URL).toBe(
      "https://example.com",
    );
  });

  it("accepts a commit SHA and an ISO timestamp", () => {
    const env = parseEnv({
      BUILD_SHA: "9afcf42",
      BUILD_TIME: "2026-10-01T12:00:00Z",
    });
    expect(env.BUILD_SHA).toBe("9afcf42");
    expect(env.BUILD_TIME).toBe("2026-10-01T12:00:00Z");
  });

  it("rejects malformed values instead of shipping them", () => {
    expect(() => parseEnv({ SITE_URL: "not a url" })).toThrow();
    expect(() => parseEnv({ SITE_URL: "ftp://example.com" })).toThrow();
    expect(() => parseEnv({ BUILD_SHA: "main" })).toThrow();
    expect(() => parseEnv({ BUILD_TIME: "yesterday" })).toThrow();
  });
});

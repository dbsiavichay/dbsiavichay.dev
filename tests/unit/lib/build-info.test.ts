import { describe, expect, it } from "vitest";

import { formatBuildTime, getBuildInfo } from "@/lib/build-info";

const now = new Date("2026-10-01T21:55:30Z");

describe("getBuildInfo", () => {
  it("links the commit of a CI build", () => {
    const sha = "76de1d52e2244368374abfc7e84176b7c39f9a3e";
    const info = getBuildInfo(
      { BUILD_SHA: sha, BUILD_TIME: "2026-10-01T12:00:00Z" },
      now,
    );
    expect(info.shortSha).toBe("76de1d5");
    expect(info.commitUrl).toBe(
      `https://github.com/dbsiavichay/dbsiavichay.dev/commit/${sha}`,
    );
    expect(info.builtAt).toBe("2026-10-01T12:00:00Z");
  });

  it("has no commit link for a local build, and uses the render time", () => {
    const info = getBuildInfo({ BUILD_SHA: "dev" }, now);
    expect(info.shortSha).toBe("dev");
    expect(info.commitUrl).toBeUndefined();
    expect(info.builtAt).toBe(now.toISOString());
  });

  it("reports the real toolchain", () => {
    const info = getBuildInfo({ BUILD_SHA: "dev" }, now);
    expect(info.nodeVersion).toBe(process.versions.node);
    expect(info.nextVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("formatBuildTime", () => {
  it("prints UTC to the minute", () => {
    expect(formatBuildTime("2026-10-01T21:55:30Z")).toBe(
      "2026-10-01 21:55 UTC",
    );
    expect(formatBuildTime("2026-10-01T23:30:00-05:00")).toBe(
      "2026-10-02 04:30 UTC",
    );
  });
});

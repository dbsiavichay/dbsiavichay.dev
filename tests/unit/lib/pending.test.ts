import { afterEach, describe, expect, it, vi } from "vitest";

import {
  confirmed,
  isPending,
  pending,
  PENDING_MARKER,
  shouldShowPending,
} from "@/lib/pending";

describe("pending", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the literal marker the brief asks for", () => {
    expect(PENDING_MARKER).toBe("TODO: CONFIRM WITH DENIS");
  });

  it("tells pending values from confirmed ones", () => {
    const value = pending("current role");
    expect(isPending(value)).toBe(true);
    expect(isPending("Software Engineer")).toBe(false);
    expect(isPending({ kind: "pending" })).toBe(false);
    expect(isPending(null)).toBe(false);
  });

  it("never exposes a pending value as confirmed", () => {
    expect(confirmed(pending("end date"))).toBeUndefined();
    expect(confirmed("2021-10")).toBe("2021-10");
  });

  it("shows markers outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(shouldShowPending()).toBe(true);
  });

  it("hides markers in production unless a preview opts in", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(shouldShowPending()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SHOW_PENDING", "true");
    expect(shouldShowPending()).toBe(true);
  });
});

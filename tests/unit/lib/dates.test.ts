import { describe, expect, it } from "vitest";

import { formatPartialDate, formatYearRange } from "@/lib/dates";

describe("formatPartialDate", () => {
  it("keeps a bare year as it is", () => {
    expect(formatPartialDate("2025", "en")).toBe("2025");
  });

  it("names the month in the page's language", () => {
    expect(formatPartialDate("2021-10", "en")).toBe("Oct 2021");
    expect(formatPartialDate("2021-10", "es")).toBe("oct 2021");
  });

  it("rejects anything that isn't YYYY or YYYY-MM", () => {
    expect(() => formatPartialDate("10/2021", "en")).toThrow();
    expect(() => formatPartialDate("2021-10-01", "en")).toThrow();
  });
});

describe("formatYearRange", () => {
  it("joins two years", () => {
    expect(formatYearRange(2019, 2021, "present")).toBe("2019 – 2021");
  });

  it("names an ongoing period", () => {
    expect(formatYearRange(2025, "present", "actualidad")).toBe(
      "2025 – actualidad",
    );
  });

  it("collapses a period inside one year", () => {
    expect(formatYearRange(2026, 2026, "present")).toBe("2026");
  });
});

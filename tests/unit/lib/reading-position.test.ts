import { describe, expect, it } from "vitest";

import { activeSection, rulerPosition } from "@/lib/reading-position";

describe("activeSection", () => {
  it("is none above the first heading", () => {
    expect(activeSection([400, 900, 1600], 270)).toBe(-1);
  });

  it("is the last heading that has crossed the reading line", () => {
    expect(activeSection([-500, 120, 900], 270)).toBe(1);
    expect(activeSection([-900, -300, 270], 270)).toBe(2);
  });

  it("is the last section at the end of the page, however short", () => {
    expect(activeSection([-900, -300, 500], 270, true)).toBe(2);
  });
});

describe("rulerPosition", () => {
  it("reads like Vim's ruler", () => {
    expect(rulerPosition(-1, 8)).toBe("Top");
    expect(rulerPosition(1, 8)).toBe("02/08");
    expect(rulerPosition(9, 12)).toBe("10/12");
  });
});

import { describe, expect, it } from "vitest";

import { keychronK2, placeKeys, plateUnits } from "@/lib/keyboard";

const UNIT = 40;
const KERF = 4;
const keys = placeKeys(keychronK2, UNIT, KERF);

type Box = { x: number; y: number; w: number; h: number };
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe("the Keychron K2 layout", () => {
  it("is a 75% board: 84 keys in six rows of 16 units", () => {
    expect(keychronK2).toHaveLength(6);
    for (const row of keychronK2) {
      expect(row.reduce((sum, key) => sum + key.width, 0)).toBe(16);
    }
    expect(keys).toHaveLength(84);
    expect(plateUnits(keychronK2)).toBe(16);
  });

  it("lights only Esc, and labels only Esc", () => {
    expect(keys.filter((key) => key.accent || key.legend)).toEqual([
      expect.objectContaining({ legend: "esc", accent: true, x: KERF / 2 }),
    ]);
  });
});

describe("placeKeys", () => {
  it("leaves the kerf between neighbours and never overlaps two keys", () => {
    for (const [i, a] of keys.entries()) {
      for (const b of keys.slice(i + 1)) {
        expect(overlaps(a, b), `${a.x},${a.y} / ${b.x},${b.y}`).toBe(false);
      }
    }
    const firstRow = keys.filter((key) => key.y === KERF / 2);
    for (const [i, key] of firstRow.slice(1).entries()) {
      const left = firstRow[i]!;
      expect(key.x - (left.x + left.w)).toBe(KERF);
    }
  });

  it("keeps every key on the plate", () => {
    for (const key of keys) {
      expect(key.x).toBeGreaterThanOrEqual(0);
      expect(key.x + key.w).toBeLessThanOrEqual(16 * UNIT);
      expect(key.y + key.h).toBeLessThanOrEqual(6 * UNIT);
    }
  });
});

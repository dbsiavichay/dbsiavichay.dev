/**
 * The geometry of a keyboard drawn in plan view, derived from its layout the
 * way the cut plan derives its drawing from the guillotine tree.
 */

/** A key: its width in units (1u is one letter key) and an optional legend. */
export type Key = { width: number; legend?: string; accent?: boolean };

const ones = (count: number): Key[] =>
  Array.from({ length: count }, () => ({ width: 1 }));

/**
 * Keychron K2, a 75% layout: 84 keys in six rows, each 16 units wide. The
 * function row, the number row, three letter rows with the navigation column
 * on the right, and the bottom row with the arrows. Only Esc has a legend.
 */
export const keychronK2: readonly (readonly Key[])[] = [
  [{ width: 1, legend: "esc", accent: true }, ...ones(15)],
  [...ones(13), { width: 2 }, { width: 1 }],
  [{ width: 1.5 }, ...ones(12), { width: 1.5 }, { width: 1 }],
  [{ width: 1.75 }, ...ones(11), { width: 2.25 }, { width: 1 }],
  [{ width: 2.25 }, ...ones(10), { width: 1.75 }, { width: 1 }, { width: 1 }],
  [
    { width: 1.25 },
    { width: 1.25 },
    { width: 1.25 },
    { width: 6.25 },
    ...ones(6),
  ],
];

export type PlacedKey = Key & {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Places every key on the plate: `unit` per key unit, and `kerf` left between
 * neighbours, as a saw blade leaves it between two pieces.
 */
export function placeKeys(
  rows: readonly (readonly Key[])[],
  unit: number,
  kerf: number,
): PlacedKey[] {
  return rows.flatMap((row, r) => {
    let x = 0;
    return row.map((key) => {
      const placed = {
        ...key,
        x: x + kerf / 2,
        y: r * unit + kerf / 2,
        w: key.width * unit - kerf,
        h: unit - kerf,
      };
      x += key.width * unit;
      return placed;
    });
  });
}

/** The widest row, in units: the length of the plate. */
export function plateUnits(rows: readonly (readonly Key[])[]): number {
  return Math.max(
    ...rows.map((row) => row.reduce((sum, key) => sum + key.width, 0)),
  );
}

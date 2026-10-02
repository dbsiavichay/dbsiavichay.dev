import { describe, expect, it } from "vitest";

import { cutList, kerf, sheets, trim } from "@/data/cut-plan";
import {
  derivePlan,
  type CutNode,
  type PieceSpec,
  type Plan,
  type Rect,
} from "@/lib/guillotine";

const specs: Record<string, PieceSpec> = Object.fromEntries(
  cutList.map((item) => [item.mark, item]),
);

const plans = sheets.map((sheet) =>
  derivePlan({
    board: sheet.size,
    trim,
    kerf,
    layout: sheet.layout,
    pieces: specs,
  }),
);

const area = (r: Rect) => r.w * r.h;

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const inside = (inner: Rect, outer: Rect) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h;

function rectsOf(plan: Plan): Rect[] {
  return [...plan.pieces, ...plan.remnants];
}

describe("the synthetic cut plan", () => {
  it("places every piece of the cut list, as many times as it's listed", () => {
    const placed = new Map<string, number>();
    for (const plan of plans) {
      for (const piece of plan.pieces) {
        placed.set(piece.mark, (placed.get(piece.mark) ?? 0) + 1);
      }
    }
    expect(Object.fromEntries(placed)).toEqual(
      Object.fromEntries(cutList.map((item) => [item.mark, item.quantity])),
    );
  });

  it("keeps every piece of a mark on the same board", () => {
    for (const item of cutList) {
      const boards = plans.filter((plan) =>
        plan.pieces.some((piece) => piece.mark === item.mark),
      );
      expect(boards, item.mark).toHaveLength(1);
    }
  });

  it.each(plans.map((plan, i) => [i + 1, plan] as const))(
    "board %i stays inside the trimmed board, without overlaps",
    (_, plan) => {
      const rects = rectsOf(plan);
      for (const rect of rects) expect(inside(rect, plan.usable)).toBe(true);
      for (const [i, a] of rects.entries()) {
        for (const b of rects.slice(i + 1)) expect(overlaps(a, b)).toBe(false);
      }
    },
  );

  it.each(plans.map((plan, i) => [i + 1, plan] as const))(
    "board %i accounts for every square millimetre: pieces, leftovers and kerf",
    (_, plan) => {
      const covered = rectsOf(plan).reduce((sum, r) => sum + area(r), 0);
      // Each cut consumes a kerf-wide band across its region, minus where it
      // crosses an earlier cut's band (never: later cuts stay inside a strip).
      const sawn = plan.cuts.reduce(
        (sum, cut) =>
          sum + kerf * (Math.abs(cut.x2 - cut.x1) + Math.abs(cut.y2 - cut.y1)),
        0,
      );
      expect(covered + sawn).toBe(area(plan.usable));
    },
  );

  it.each(plans.map((plan, i) => [i + 1, plan] as const))(
    "board %i only has guillotine cuts: none runs through a piece",
    (_, plan) => {
      for (const cut of plan.cuts) {
        for (const piece of plan.pieces) {
          const crosses =
            cut.direction === "vertical"
              ? cut.x1 > piece.x &&
                cut.x1 < piece.x + piece.w &&
                Math.max(cut.y1, piece.y) < Math.min(cut.y2, piece.y + piece.h)
              : cut.y1 > piece.y &&
                cut.y1 < piece.y + piece.h &&
                Math.max(cut.x1, piece.x) < Math.min(cut.x2, piece.x + piece.w);
          expect(crosses, `cut ${cut.index} through ${piece.mark}`).toBe(false);
        }
      }
    },
  );

  it("frees each piece with a cut that exists", () => {
    for (const plan of plans) {
      for (const piece of plan.pieces) {
        expect(piece.releasedBy).toBeGreaterThanOrEqual(1);
        expect(piece.releasedBy).toBeLessThanOrEqual(plan.cuts.length);
      }
    }
  });

  it("bills a whole board and a half board", () => {
    expect(sheets.map((sheet) => sheet.kind)).toEqual(["whole", "half"]);
    const [whole, half] = sheets;
    expect(half!.size.w * 2).toBe(whole!.size.w);
    expect(half!.size.h).toBe(whole!.size.h);
  });
});

describe("derivePlan", () => {
  const board = { w: 1000, h: 500 };
  const pieces = {
    P: { length: 600, width: 480, grain: true },
    Q: { length: 300, width: 376, grain: false },
  };
  const plan = (layout: CutNode) =>
    derivePlan({ board, trim: 10, kerf: 4, layout, pieces });

  it("numbers a split's cuts before the cuts inside its strips", () => {
    const { cuts, pieces: placed } = plan({
      split: "columns",
      parts: [
        { size: 600, node: { piece: "P" } },
        {
          node: {
            split: "rows",
            parts: [
              { size: 300, node: { piece: "Q", rotated: true } },
              { node: { remnant: "offcut" } },
            ],
          },
        },
      ],
    });
    expect(cuts.map((c) => [c.index, c.direction])).toEqual([
      [1, "vertical"],
      [2, "horizontal"],
    ]);
    // The first cut runs down the whole trimmed height, through the kerf.
    expect(cuts[0]).toMatchObject({ x1: 612, y1: 10, x2: 612, y2: 490 });
    expect(placed.map((p) => [p.mark, p.releasedBy])).toEqual([
      ["P", 1],
      ["Q", 2],
    ]);
  });

  it("rejects a rotated piece with grain", () => {
    expect(() =>
      plan({
        split: "columns",
        parts: [
          { size: 480, node: { piece: "P", rotated: true } },
          { node: { remnant: "waste" } },
        ],
      }),
    ).toThrow(/grain/);
  });

  it("rejects a piece that doesn't fill its strip", () => {
    expect(() =>
      plan({
        split: "columns",
        parts: [
          { size: 610, node: { piece: "P" } },
          { node: { remnant: "waste" } },
        ],
      }),
    ).toThrow(/strip/);
  });

  it("rejects strips that overflow or don't add up", () => {
    expect(() =>
      plan({
        split: "columns",
        parts: [
          { size: 600, node: { piece: "P" } },
          { size: 600, node: { remnant: "waste" } },
        ],
      }),
    ).toThrow(/add up/);
    expect(() =>
      plan({
        split: "columns",
        parts: [
          { size: 980, node: { remnant: "waste" } },
          { node: { remnant: "waste" } },
        ],
      }),
    ).toThrow(/overflow/);
  });
});

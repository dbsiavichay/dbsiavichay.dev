/**
 * A guillotine cut plan written as a tree. Every split is a run of saw cuts
 * from edge to edge of a region; every leaf is a piece, a kept offcut or
 * waste. Placements, leftovers and the order of the cuts are derived from the
 * tree, so a drawing built on it can only show plans a panel saw can cut.
 *
 * Units are millimetres. The board's grain runs along x, so a piece with
 * grain keeps its length along x and never rotates.
 */

export type Size = { w: number; h: number };

export type Rect = { x: number; y: number; w: number; h: number };

/** `columns`: vertical cuts split the width; `rows`: horizontal cuts split the height. */
export type SplitKind = "columns" | "rows";

export type RemnantKind = "offcut" | "waste";

export type CutNode =
  | { piece: string; rotated?: boolean }
  | { remnant: RemnantKind }
  | { split: SplitKind; parts: Part[] };

/** One strip of a split. Only the last part may leave out its size: it takes the rest. */
export type Part = { size?: number; node: CutNode };

export type PieceSpec = { length: number; width: number; grain: boolean };

export type PlacedPiece = Rect & {
  mark: string;
  rotated: boolean;
  /** The cut that frees the piece from the board: 0 if it needs none. */
  releasedBy: number;
};

export type Remnant = Rect & { kind: RemnantKind; releasedBy: number };

export type Cut = {
  /** Position in the saw's sequence, from 1. */
  index: number;
  direction: "vertical" | "horizontal";
  /** The cut runs along the middle of the kerf, across its whole region. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Plan = {
  board: Size;
  /** The board after trimming its edges square. */
  usable: Rect;
  pieces: PlacedPiece[];
  remnants: Remnant[];
  cuts: Cut[];
};

export type PlanInput = {
  board: Size;
  /** Trimmed from each edge before cutting. */
  trim: number;
  /** Width of the saw blade: what every cut consumes. */
  kerf: number;
  layout: CutNode;
  pieces: Record<string, PieceSpec>;
};

/**
 * Lays the tree out on the board. The saw makes a split's cuts first and then
 * works each strip in order, which numbers the cuts the way a panel saw runs
 * them: rip the board into strips, then cross-cut each strip.
 *
 * Throws on a plan that can't be cut: a piece that doesn't fill its strip
 * exactly, a rotated piece with grain, or strips that don't add up.
 */
export function derivePlan({
  board,
  trim,
  kerf,
  layout,
  pieces: specs,
}: PlanInput): Plan {
  const usable: Rect = {
    x: trim,
    y: trim,
    w: board.w - 2 * trim,
    h: board.h - 2 * trim,
  };
  const pieces: PlacedPiece[] = [];
  const remnants: Remnant[] = [];
  const cuts: Cut[] = [];

  function visit(node: CutNode, region: Rect, releasedBy: number) {
    if ("piece" in node) {
      const spec = specs[node.piece];
      if (!spec) throw new Error(`unknown piece "${node.piece}"`);
      const rotated = node.rotated ?? false;
      if (rotated && spec.grain) {
        throw new Error(`piece ${node.piece} has grain and cannot rotate`);
      }
      const [w, h] = rotated
        ? [spec.width, spec.length]
        : [spec.length, spec.width];
      if (w !== region.w || h !== region.h) {
        throw new Error(
          `piece ${node.piece} is ${w}×${h} but its strip is ${region.w}×${region.h}`,
        );
      }
      pieces.push({ ...region, mark: node.piece, rotated, releasedBy });
      return;
    }

    if ("remnant" in node) {
      remnants.push({ ...region, kind: node.remnant, releasedBy });
      return;
    }

    const columns = node.split === "columns";
    const extent = columns ? region.w : region.h;
    const { parts } = node;
    if (parts.length < 2) throw new Error("a split needs at least two parts");

    const known = parts.reduce((sum, part) => sum + (part.size ?? 0), 0);
    const kerfs = kerf * (parts.length - 1);
    const sizes = parts.map((part, i) => {
      if (part.size !== undefined) return part.size;
      if (i !== parts.length - 1) {
        throw new Error("only the last part of a split may take the rest");
      }
      return extent - known - kerfs;
    });
    if (sizes.some((size) => size <= 0)) {
      throw new Error(`the parts of a split overflow its ${extent} mm`);
    }
    if (sizes.reduce((a, b) => a + b, 0) + kerfs !== extent) {
      throw new Error(`the parts of a split don't add up to its ${extent} mm`);
    }

    const start = columns ? region.x : region.y;
    const strips: Rect[] = [];
    const cutAfter: number[] = [];
    let offset = start;
    sizes.forEach((size, i) => {
      strips.push(
        columns
          ? { x: offset, y: region.y, w: size, h: region.h }
          : { x: region.x, y: offset, w: region.w, h: size },
      );
      offset += size;
      if (i === sizes.length - 1) return;
      const at = offset + kerf / 2;
      cuts.push(
        columns
          ? {
              index: cuts.length + 1,
              direction: "vertical",
              x1: at,
              y1: region.y,
              x2: at,
              y2: region.y + region.h,
            }
          : {
              index: cuts.length + 1,
              direction: "horizontal",
              x1: region.x,
              y1: at,
              x2: region.x + region.w,
              y2: at,
            },
      );
      cutAfter.push(cuts.length);
      offset += kerf;
    });

    strips.forEach((strip, i) => {
      // A strip is free once the cuts on both of its sides are made.
      const freed = Math.max(
        releasedBy,
        cutAfter[i - 1] ?? 0,
        cutAfter[i] ?? 0,
      );
      visit(parts[i]!.node, strip, freed);
    });
  }

  visit(layout, usable, 0);
  return { board, usable, pieces, remnants, cuts };
}

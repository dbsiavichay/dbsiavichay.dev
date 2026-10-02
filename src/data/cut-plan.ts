import type { Localized } from "@/i18n/localized";
import type { CutNode, Size } from "@/lib/guillotine";

/**
 * The cut plan drawn in the Maderable case study. Synthetic on purpose: no
 * real order, customer, size or price. It exists to show the rules the
 * optimizer works with — kerf, trim, grain, edge banding, the half board as
 * a bin of its own — on a plan the saw could actually run.
 */

export type CutListItem = {
  mark: string;
  part: Localized;
  /** Along the grain, in millimetres. */
  length: number;
  width: number;
  quantity: number;
  /** A piece with grain keeps its length along the board's grain. */
  grain: boolean;
  /** How many long and short edges get edge banding. */
  banding: { long: 0 | 1 | 2; short: 0 | 1 | 2 };
};

export const cutList: CutListItem[] = [
  {
    mark: "A",
    part: { en: "Side", es: "Lateral" },
    length: 1800,
    width: 560,
    quantity: 2,
    grain: true,
    banding: { long: 1, short: 0 },
  },
  {
    mark: "B",
    part: { en: "Top and bottom", es: "Techo y piso" },
    length: 1200,
    width: 560,
    quantity: 2,
    grain: true,
    banding: { long: 1, short: 0 },
  },
  {
    mark: "C",
    part: { en: "Shelf", es: "Repisa" },
    length: 616,
    width: 500,
    quantity: 3,
    grain: true,
    banding: { long: 1, short: 0 },
  },
  {
    mark: "D",
    part: { en: "Door", es: "Puerta" },
    length: 1800,
    width: 596,
    quantity: 1,
    grain: true,
    banding: { long: 2, short: 2 },
  },
  {
    mark: "E",
    part: { en: "Rail", es: "Travesaño" },
    length: 616,
    width: 100,
    quantity: 2,
    grain: false,
    banding: { long: 0, short: 0 },
  },
  {
    mark: "F",
    part: { en: "Stiffener", es: "Refuerzo" },
    length: 682,
    width: 100,
    quantity: 2,
    grain: false,
    banding: { long: 0, short: 0 },
  },
];

/** Trimmed from every edge before the first cut, and the saw blade's width. */
export const trim = 10;
export const kerf = 4;

export type SheetKind = "whole" | "half";

export type Sheet = { kind: SheetKind; size: Size; layout: CutNode };

const board: Size = { w: 2440, h: 1830 };

export const sheets: Sheet[] = [
  {
    // Rip one column for the long pieces and one for the short ones, then
    // cross-cut each. The two thin strips left at the ends are waste.
    kind: "whole",
    size: board,
    layout: {
      split: "columns",
      parts: [
        {
          size: 1800,
          node: {
            split: "rows",
            parts: [
              { size: 560, node: { piece: "A" } },
              { size: 560, node: { piece: "A" } },
              { size: 596, node: { piece: "D" } },
              { node: { remnant: "waste" } },
            ],
          },
        },
        {
          node: {
            split: "rows",
            parts: [
              { size: 500, node: { piece: "C" } },
              { size: 500, node: { piece: "C" } },
              { size: 500, node: { piece: "C" } },
              { size: 100, node: { piece: "E" } },
              { size: 100, node: { piece: "E" } },
              { node: { remnant: "waste" } },
            ],
          },
        },
      ],
    },
  },
  {
    // The rest fits on half a board, split across its length. The
    // stiffeners have no grain, so they turn to stand beside each other and
    // leave one large offcut instead of two narrow ones.
    kind: "half",
    size: { w: board.w / 2, h: board.h },
    layout: {
      split: "rows",
      parts: [
        { size: 560, node: { piece: "B" } },
        { size: 560, node: { piece: "B" } },
        {
          node: {
            split: "columns",
            parts: [
              { size: 100, node: { piece: "F", rotated: true } },
              { size: 100, node: { piece: "F", rotated: true } },
              { node: { remnant: "offcut" } },
            ],
          },
        },
      ],
    },
  },
];

/** What the customer is billed for this cut list, in words. */
export const billedAs: Localized = {
  en: "Billed as one board and one half board",
  es: "Se cobra un tablero y un medio tablero",
};

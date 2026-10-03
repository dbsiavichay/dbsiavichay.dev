"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useState } from "react";

import type { CutListItem, SheetKind } from "@/data/cut-plan";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PlacedPiece, Plan } from "@/lib/guillotine";

export type ViewerBoard = { kind: SheetKind; plan: Plan };

export type ViewerItem = Omit<CutListItem, "part"> & {
  part: string;
  /** Index of the board the piece is cut from. */
  board: number;
};

type CutPlanViewerProps = {
  boards: ViewerBoard[];
  items: ViewerItem[];
  billedAs: string;
  labels: Dictionary["cutPlan"];
};

// Room around the board, in millimetres, for the dimension lines.
const MARGIN = { top: 150, right: 24, bottom: 24, left: 150 };

// Strokes stay one device pixel wide however the drawing is scaled.
const hairline = "non-scaling-stroke";

const format = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

const unique = <T,>(values: T[]) => [...new Set(values)];

/** Which edges of a placed piece carry edge banding. */
function bandedEdges(piece: PlacedPiece, banding: CutListItem["banding"]) {
  // Unrotated, the length runs along x: the long edges are top and bottom.
  const [long, short] = piece.rotated
    ? [
        ["right", "left"],
        ["bottom", "top"],
      ]
    : [
        ["bottom", "top"],
        ["right", "left"],
      ];
  return [...long!.slice(0, banding.long), ...short!.slice(0, banding.short)];
}

function edgeLine(piece: PlacedPiece, edge: string, inset: number) {
  const { x, y, w, h } = piece;
  switch (edge) {
    case "top":
      return { x1: x + inset, y1: y + inset, x2: x + w - inset, y2: y + inset };
    case "bottom":
      return {
        x1: x + inset,
        y1: y + h - inset,
        x2: x + w - inset,
        y2: y + h - inset,
      };
    case "left":
      return { x1: x + inset, y1: y + inset, x2: x + inset, y2: y + h - inset };
    default:
      return {
        x1: x + w - inset,
        y1: y + inset,
        x2: x + w - inset,
        y2: y + h - inset,
      };
  }
}

/**
 * A synthetic cut plan to explore: switch boards, step through the saw's
 * sequence, pick a piece from the cut list. The geometry is computed on the
 * server from a guillotine tree; this island only draws it.
 */
export function CutPlanViewer({
  boards,
  items,
  billedAs,
  labels,
}: CutPlanViewerProps) {
  const [boardIndex, setBoardIndex] = useState(0);
  const [steps, setSteps] = useState(() =>
    boards.map((board) => board.plan.cuts.length),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [layers, setLayers] = useState({ grain: true, banding: true });
  const id = useId().replace(/[^\w-]/g, "");

  const { plan } = boards[boardIndex]!;
  const total = plan.cuts.length;
  const step = steps[boardIndex]!;
  const stepping = step < total;
  const byMark = new Map(items.map((item) => [item.mark, item]));
  const widest = Math.max(...boards.map((b) => b.plan.board.w));

  const { w: W, h: H } = plan.board;
  const viewW = W + MARGIN.left + MARGIN.right;
  const viewH = H + MARGIN.top + MARGIN.bottom;
  const widthShare = (viewW / (widest + MARGIN.left + MARGIN.right)) * 100;

  function setStep(next: number) {
    setSteps((all) =>
      all.map((value, i) =>
        i === boardIndex ? Math.min(Math.max(next, 0), total) : value,
      ),
    );
  }

  function select(mark: string) {
    if (selected === mark) {
      setSelected(null);
      return;
    }
    setSelected(mark);
    const board = byMark.get(mark)?.board;
    if (board !== undefined) setBoardIndex(board);
  }

  const freed = unique(
    plan.pieces.filter((p) => p.releasedBy === step).map((p) => p.mark),
  );
  const status =
    step === total
      ? format(labels.complete, { total })
      : step === 0
        ? labels.before
        : freed.length > 0
          ? format(labels.frees, { n: step, total, pieces: freed.join(", ") })
          : format(labels.splits, { n: step, total });

  const current = stepping && step > 0 ? plan.cuts[step - 1] : undefined;

  return (
    <figure className="not-prose my-12 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
        <p className="label-mono text-fg">{labels.title}</p>
        <p className="text-sm text-fg-muted">{billedAs}</p>
      </div>

      <div
        role="group"
        aria-label={labels.boards}
        className="flex gap-1 border-b border-line px-4 py-2 sm:px-5"
      >
        {boards.map((board, i) => (
          <button
            key={board.kind}
            type="button"
            aria-pressed={i === boardIndex}
            onClick={() => setBoardIndex(i)}
            className="flex min-h-9 items-baseline gap-2 rounded-sm px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg aria-pressed:bg-raised aria-pressed:text-fg"
          >
            {board.kind === "whole" ? labels.whole : labels.half}
            <span className="font-mono text-xs text-fg-subtle max-sm:hidden">
              {format(labels.pieceCount, { count: board.plan.pieces.length })}
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 py-5 sm:px-6">
        <svg
          viewBox={`${-MARGIN.left} ${-MARGIN.top} ${viewW} ${viewH}`}
          aria-hidden="true"
          focusable="false"
          className="block h-auto font-mono"
          style={{ width: `${widthShare}%` }}
        >
          <defs>
            <pattern
              id={`${id}-hatch`}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="48"
                className="stroke-line-strong"
                vectorEffect={hairline}
              />
            </pattern>
            <pattern
              id={`${id}-grain`}
              width="400"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 20 C 100 12, 300 28, 400 20"
                fill="none"
                className="stroke-line-strong opacity-40"
                vectorEffect={hairline}
              />
            </pattern>
          </defs>

          {/* Dimension lines: the board's width above, its height to the left. */}
          <g className="stroke-fg-subtle">
            <line x1={0} y1={-80} x2={W} y2={-80} vectorEffect={hairline} />
            <line x1={0} y1={-110} x2={0} y2={-50} vectorEffect={hairline} />
            <line x1={W} y1={-110} x2={W} y2={-50} vectorEffect={hairline} />
            <line x1={-80} y1={0} x2={-80} y2={H} vectorEffect={hairline} />
            <line x1={-110} y1={0} x2={-50} y2={0} vectorEffect={hairline} />
            <line x1={-110} y1={H} x2={-50} y2={H} vectorEffect={hairline} />
          </g>
          <g className="fill-fg-subtle text-[44px] max-sm:text-[96px]">
            <rect
              x={W / 2 - 140}
              y={-130}
              width={280}
              height={100}
              className="fill-surface"
            />
            <text x={W / 2} y={-64} textAnchor="middle">
              {W}
            </text>
            <rect
              x={-130}
              y={H / 2 - 140}
              width={100}
              height={280}
              className="fill-surface"
            />
            <text
              x={-64}
              y={H / 2}
              textAnchor="middle"
              transform={`rotate(-90 -64 ${H / 2})`}
            >
              {H}
            </text>
          </g>

          {/* The board, and the edge trimmed square inside it. */}
          <rect
            width={W}
            height={H}
            className="fill-canvas stroke-line-strong"
            vectorEffect={hairline}
          />
          <rect
            x={plan.usable.x}
            y={plan.usable.y}
            width={plan.usable.w}
            height={plan.usable.h}
            fill="none"
            strokeDasharray="4 4"
            className="stroke-line-strong"
            vectorEffect={hairline}
          />

          {plan.remnants.map((remnant) => {
            const free = remnant.releasedBy <= step;
            return (
              <g key={`${remnant.x}-${remnant.y}`}>
                <rect
                  x={remnant.x}
                  y={remnant.y}
                  width={remnant.w}
                  height={remnant.h}
                  fill={
                    free && remnant.kind === "offcut"
                      ? `url(#${id}-hatch)`
                      : undefined
                  }
                  className={
                    !free
                      ? "fill-transparent stroke-line"
                      : remnant.kind === "waste"
                        ? "fill-line stroke-line-strong"
                        : "stroke-line-strong"
                  }
                  vectorEffect={hairline}
                />
                {free && remnant.kind === "offcut" ? (
                  <text
                    x={remnant.x + remnant.w / 2}
                    y={remnant.y + remnant.h / 2 + 16}
                    textAnchor="middle"
                    className="fill-fg-muted text-[48px] uppercase max-sm:hidden"
                    letterSpacing="4"
                  >
                    {labels.offcut}
                  </text>
                ) : null}
              </g>
            );
          })}

          {plan.pieces.map((piece, i) => {
            const item = byMark.get(piece.mark)!;
            const free = piece.releasedBy <= step;
            const active = selected === piece.mark;
            const large = piece.w >= 400 && piece.h >= 300;
            return (
              <g
                key={`${piece.mark}-${i}`}
                onClick={() => select(piece.mark)}
                className="cursor-pointer"
              >
                <rect
                  x={piece.x}
                  y={piece.y}
                  width={piece.w}
                  height={piece.h}
                  strokeDasharray={free ? undefined : "6 6"}
                  className={
                    !free
                      ? "fill-transparent stroke-line"
                      : active
                        ? "fill-accent-soft stroke-accent"
                        : "fill-raised stroke-line-strong transition-colors hover:fill-surface"
                  }
                  vectorEffect={hairline}
                />
                {free && layers.grain && item.grain ? (
                  <rect
                    x={piece.x}
                    y={piece.y}
                    width={piece.w}
                    height={piece.h}
                    fill={`url(#${id}-grain)`}
                    className="pointer-events-none"
                  />
                ) : null}
                {free && layers.banding
                  ? bandedEdges(piece, item.banding).map((edge) => (
                      <line
                        key={edge}
                        {...edgeLine(piece, edge, 14)}
                        strokeWidth={3}
                        strokeLinecap="round"
                        className="pointer-events-none stroke-signal-info"
                        vectorEffect={hairline}
                      />
                    ))
                  : null}
                {free ? (
                  <text
                    x={piece.x + (large ? 36 : piece.w / 2)}
                    y={piece.y + (large ? 84 : piece.h / 2 + 18)}
                    textAnchor={large ? "start" : "middle"}
                    className={
                      (active ? "fill-accent-text " : "fill-fg ") +
                      (large
                        ? "pointer-events-none text-[56px] font-medium max-sm:text-[110px]"
                        : "pointer-events-none text-[48px] max-sm:hidden")
                    }
                  >
                    {piece.mark}
                  </text>
                ) : null}
                {free && large ? (
                  <text
                    x={piece.x + piece.w / 2}
                    y={piece.y + piece.h / 2 + 30}
                    textAnchor="middle"
                    className="pointer-events-none fill-fg-subtle text-[44px] max-sm:hidden"
                  >
                    {piece.w} × {piece.h}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* While stepping: the cuts made so far, the last one highlighted. */}
          {stepping
            ? plan.cuts
                .slice(0, step)
                .map((cut) => (
                  <line
                    key={cut.index}
                    x1={cut.x1}
                    y1={cut.y1}
                    x2={cut.x2}
                    y2={cut.y2}
                    strokeWidth={cut === current ? 2.5 : 1}
                    className={
                      cut === current ? "stroke-accent" : "stroke-fg-subtle"
                    }
                    vectorEffect={hairline}
                  />
                ))
            : null}
          {current ? (
            <g className="max-sm:hidden">
              <circle
                cx={
                  current.direction === "vertical"
                    ? current.x1
                    : current.x1 + 70
                }
                cy={
                  current.direction === "vertical"
                    ? current.y1 + 70
                    : current.y1
                }
                r={44}
                className="fill-accent"
              />
              <text
                x={
                  current.direction === "vertical"
                    ? current.x1
                    : current.x1 + 70
                }
                y={
                  (current.direction === "vertical"
                    ? current.y1 + 70
                    : current.y1) + 15
                }
                textAnchor="middle"
                className="fill-on-accent text-[42px] font-medium"
              >
                {current.index}
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            aria-label={labels.previous}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line-strong text-fg transition-colors hover:bg-raised disabled:opacity-40 [&_svg]:size-4"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <input
            type="range"
            min={0}
            max={total}
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
            aria-label={labels.sequence}
            aria-valuetext={format(labels.stepValue, { n: step, total })}
            className="h-9 min-w-0 flex-1 accent-accent"
          />
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={step === total}
            aria-label={labels.next}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line-strong text-fg transition-colors hover:bg-raised disabled:opacity-40 [&_svg]:size-4"
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <span className="w-14 shrink-0 text-right font-mono text-xs text-fg-subtle">
            {step}/{total}
          </span>
        </div>
        <p aria-live="polite" className="mt-3 min-h-6 text-sm text-fg-muted">
          {status}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-4 py-3 sm:px-5">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-subtle">
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-[2px] border border-line-strong bg-raised"
            />
            {labels.legend.piece}
          </li>
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
              <rect
                x="0.5"
                y="0.5"
                width="11"
                height="11"
                fill={`url(#${id}-legend-hatch)`}
                className="stroke-line-strong"
              />
              <defs>
                <pattern
                  id={`${id}-legend-hatch`}
                  width="3"
                  height="3"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="3"
                    className="stroke-line-strong"
                  />
                </pattern>
              </defs>
            </svg>
            {labels.legend.offcut}
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-[2px] border border-line-strong bg-line"
            />
            {labels.legend.waste}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-0.5 bg-accent" />
            {labels.legend.cut}
          </li>
        </ul>
        <fieldset className="flex items-center gap-4 text-sm text-fg-muted">
          <legend className="sr-only">{labels.layers}</legend>
          <span aria-hidden="true" className="label-mono text-fg-subtle">
            {labels.layers}
          </span>
          <label className="flex min-h-9 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={layers.grain}
              onChange={(e) =>
                setLayers((l) => ({ ...l, grain: e.target.checked }))
              }
              className="size-4 accent-accent"
            />
            {labels.grain}
          </label>
          <label className="flex min-h-9 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={layers.banding}
              onChange={(e) =>
                setLayers((l) => ({ ...l, banding: e.target.checked }))
              }
              className="size-4 accent-accent"
            />
            <span
              aria-hidden="true"
              className="h-0.5 w-3 rounded-full bg-signal-info"
            />
            {labels.banding}
          </label>
        </fieldset>
      </div>

      <div className="overflow-x-auto border-t border-line">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{labels.table.caption}</caption>
          <thead className="label-mono text-fg-subtle">
            <tr className="border-b border-line">
              <th
                scope="col"
                className="py-2 pr-2 pl-4 font-normal sm:pr-3 sm:pl-5"
              >
                {labels.table.piece}
              </th>
              <th
                scope="col"
                className="px-2 py-2 font-normal max-sm:hidden sm:px-3"
              >
                {labels.table.size}
              </th>
              <th
                scope="col"
                className="px-1 py-2 text-right font-normal sm:px-3"
              >
                {labels.table.quantity}
              </th>
              <th scope="col" className="px-1 py-2 font-normal sm:px-3">
                {labels.table.grain}
              </th>
              <th
                scope="col"
                className="py-2 pr-4 pl-1 font-normal sm:pr-5 sm:pl-3"
              >
                {labels.table.banding}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => {
              const active = selected === item.mark;
              const rotated = boards[item.board]?.plan.pieces.some(
                (p) => p.mark === item.mark && p.rotated,
              );
              const banding = [
                item.banding.long ? `${item.banding.long}${labels.long}` : "",
                item.banding.short
                  ? `${item.banding.short}${labels.short}`
                  : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <tr
                  key={item.mark}
                  className={
                    active
                      ? "bg-accent-soft"
                      : "transition-colors hover:bg-raised"
                  }
                >
                  <td className="py-1 pr-1 pl-2 sm:pr-3 sm:pl-3">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => select(item.mark)}
                      aria-label={format(labels.select, { mark: item.mark })}
                      className="flex min-h-9 w-full items-center gap-2 rounded-sm py-1 pr-1 pl-2 text-left sm:gap-3 sm:pr-2"
                    >
                      <span
                        className={
                          active
                            ? "font-mono font-medium text-accent-text"
                            : "font-mono font-medium text-fg"
                        }
                      >
                        {item.mark}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-fg-muted">{item.part}</span>
                        <span className="font-mono text-xs whitespace-nowrap text-fg-subtle sm:hidden">
                          {item.length} × {item.width}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-1 font-mono text-xs whitespace-nowrap text-fg-muted max-sm:hidden">
                    {item.length} × {item.width}
                  </td>
                  <td className="px-1 py-1 text-right font-mono text-xs text-fg-muted sm:px-3">
                    {item.quantity}
                  </td>
                  <td className="px-1 py-1 font-mono text-xs text-fg-muted sm:px-3">
                    {item.grain
                      ? labels.yes
                      : rotated
                        ? `${labels.no} · ${labels.rotated}`
                        : labels.no}
                  </td>
                  <td className="py-1 pr-4 pl-1 font-mono text-xs whitespace-nowrap text-fg-muted sm:pr-5 sm:pl-3">
                    {banding || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <figcaption className="border-t border-line px-4 py-3 text-sm text-fg-subtle sm:px-5">
        {labels.caption}{" "}
        <span className="font-mono text-xs">{labels.bandingKey}</span>
      </figcaption>
    </figure>
  );
}

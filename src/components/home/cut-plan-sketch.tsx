import { cn } from "@/lib/utils";

type Rect = { x: number; y: number; w: number; h: number; mark: string };

// A synthetic guillotine layout on a half board: three vertical strips, each
// cut across. The gaps between pieces are the kerf; the hatched areas are
// offcuts. No real order, size or figure is drawn here.
const pieces: Rect[] = [
  { x: 28, y: 64, w: 240, h: 140, mark: "A" },
  { x: 28, y: 208, w: 240, h: 110, mark: "B" },
  { x: 28, y: 322, w: 240, h: 86, mark: "C" },
  { x: 272, y: 248, w: 98, h: 90, mark: "E" },
  { x: 374, y: 248, w: 98, h: 90, mark: "F" },
  { x: 476, y: 64, w: 136, h: 130, mark: "G" },
  { x: 476, y: 198, w: 136, h: 130, mark: "H" },
];
const highlighted: Rect = { x: 272, y: 64, w: 200, h: 180, mark: "D" };
const offcuts = [
  { x: 272, y: 342, w: 200, h: 66 },
  { x: 476, y: 332, w: 136, h: 76 },
];

// Strokes stay one device pixel wide at any size.
const hairline = "non-scaling-stroke";

type CutPlanSketchProps = {
  caption: string;
  labels: { board: string; kerf: string; offcut: string };
  className?: string;
};

/** A drawing in the style of the cut plans Maderable produces. Decorative. */
export function CutPlanSketch({
  caption,
  labels,
  className,
}: CutPlanSketchProps) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <svg
        viewBox="0 0 640 448"
        aria-hidden="true"
        focusable="false"
        className="h-auto w-full font-mono"
      >
        <defs>
          <pattern
            id="cut-plan-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" className="stroke-line-strong" />
          </pattern>
        </defs>

        {/* Dimension line across the board. */}
        <g className="stroke-fg-subtle">
          <line x1="20" y1="30" x2="620" y2="30" vectorEffect={hairline} />
          <line x1="20" y1="22" x2="20" y2="38" vectorEffect={hairline} />
          <line x1="620" y1="22" x2="620" y2="38" vectorEffect={hairline} />
        </g>
        <g className="max-sm:hidden">
          <rect
            x="250"
            y="20"
            width="140"
            height="20"
            className="fill-surface"
          />
          <text
            x="320"
            y="35"
            textAnchor="middle"
            className="fill-fg-subtle text-[14px] uppercase"
            letterSpacing="1.5"
          >
            {labels.board}
          </text>
        </g>

        {/* The board, and the trimmed edge inside it. */}
        <rect
          x="20"
          y="56"
          width="600"
          height="360"
          className="fill-canvas stroke-line-strong"
          vectorEffect={hairline}
        />
        <rect
          x="28"
          y="64"
          width="584"
          height="344"
          fill="none"
          strokeDasharray="4 4"
          className="stroke-line-strong"
          vectorEffect={hairline}
        />

        {offcuts.map((offcut) => (
          <rect
            key={`${offcut.x}-${offcut.y}`}
            x={offcut.x}
            y={offcut.y}
            width={offcut.w}
            height={offcut.h}
            fill="url(#cut-plan-hatch)"
            className="stroke-line-strong"
            vectorEffect={hairline}
          />
        ))}

        {pieces.map((piece) => (
          <g key={piece.mark}>
            <rect
              x={piece.x}
              y={piece.y}
              width={piece.w}
              height={piece.h}
              className="fill-raised stroke-line-strong"
              vectorEffect={hairline}
            />
            <text
              x={piece.x + 10}
              y={piece.y + 22}
              className="fill-fg-subtle text-[14px] max-sm:hidden"
            >
              {piece.mark}
            </text>
          </g>
        ))}

        <rect
          x={highlighted.x}
          y={highlighted.y}
          width={highlighted.w}
          height={highlighted.h}
          className="fill-accent-soft stroke-accent"
          vectorEffect={hairline}
        />
        <text
          x={highlighted.x + 10}
          y={highlighted.y + 22}
          className="fill-accent-text text-[14px] max-sm:hidden"
        >
          {highlighted.mark}
        </text>

        <text
          x="372"
          y="381"
          textAnchor="middle"
          className="fill-fg-muted text-[13px] uppercase max-sm:hidden"
          letterSpacing="1.5"
        >
          {labels.offcut}
        </text>

        {/* Kerf callout: the saw blade's width between two strips. */}
        <g className="max-sm:hidden">
          <polyline
            points="270,300 270,432 300,432"
            fill="none"
            className="stroke-fg-subtle"
            vectorEffect={hairline}
          />
          <circle cx="270" cy="300" r="3" className="fill-fg-subtle" />
          <text
            x="308"
            y="437"
            className="fill-fg-subtle text-[14px] uppercase"
            letterSpacing="1.5"
          >
            {labels.kerf}
          </text>
        </g>
      </svg>
      <figcaption className="label-mono text-fg-subtle">{caption}</figcaption>
    </figure>
  );
}

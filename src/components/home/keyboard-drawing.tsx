import { keychronK2, placeKeys, plateUnits } from "@/lib/keyboard";
import { cn } from "@/lib/utils";

const UNIT = 40;
const KERF = 4;
/** The plate's margin around the keys. */
const PAD = 10;
/** Room above the plate for the dimension line. */
const TOP = 40;

const keys = placeKeys(keychronK2, UNIT, KERF);
const width = plateUnits(keychronK2) * UNIT + 2 * PAD;
const height = TOP + keychronK2.length * UNIT + 2 * PAD;

type KeyboardDrawingProps = {
  caption: string;
  /** The label on the dimension line: the layout, "75%". */
  size: string;
  className?: string;
};

/**
 * The keyboard in plan view, drawn like a cut plan: the keys are pieces on a
 * plate and the gaps between them are the kerf. Decorative; generated from
 * the layout in `lib/keyboard.ts`.
 */
export function KeyboardDrawing({
  caption,
  size,
  className,
}: KeyboardDrawingProps) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
        focusable="false"
        className="h-auto w-full font-mono **:[vector-effect:non-scaling-stroke]"
      >
        {/* Dimension line across the plate. */}
        <g className="stroke-fg-subtle">
          <line x1={PAD} y1="14" x2={width - PAD} y2="14" />
          <line x1={PAD} y1="6" x2={PAD} y2="22" />
          <line x1={width - PAD} y1="6" x2={width - PAD} y2="22" />
        </g>
        <g className="max-sm:hidden">
          <rect
            x={width / 2 - 36}
            y="4"
            width="72"
            height="20"
            className="fill-canvas"
          />
          <text
            x={width / 2}
            y="19"
            textAnchor="middle"
            className="fill-fg-subtle text-[14px]"
            letterSpacing="1.5"
          >
            {size}
          </text>
        </g>

        <rect
          x="0.5"
          y={TOP}
          width={width - 1}
          height={height - TOP - 0.5}
          rx="8"
          className="fill-surface stroke-line-strong"
        />

        <g className="fill-raised stroke-line-strong">
          {keys
            .filter((key) => !key.accent)
            .map((key) => (
              <rect
                key={`${key.x}-${key.y}`}
                x={PAD + key.x}
                y={TOP + PAD + key.y}
                width={key.w}
                height={key.h}
                rx="3"
              />
            ))}
        </g>

        {keys
          .filter((key) => key.accent)
          .map((key) => (
            <g key={`${key.x}-${key.y}`}>
              <rect
                x={PAD + key.x}
                y={TOP + PAD + key.y}
                width={key.w}
                height={key.h}
                rx="3"
                className="fill-accent-soft stroke-accent"
              />
              <text
                x={PAD + key.x + key.w / 2}
                y={TOP + PAD + key.y + key.h / 2 + 5}
                textAnchor="middle"
                className="fill-accent-text text-[13px] max-sm:hidden"
              >
                {key.legend}
              </text>
            </g>
          ))}
      </svg>
      <figcaption className="label-mono text-fg-subtle">{caption}</figcaption>
    </figure>
  );
}

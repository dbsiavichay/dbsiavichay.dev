import {
  arrowHead,
  labelAnchor,
  pathData,
  type DiagramNode,
  type EdgeKind,
  type NodeKind,
  type Point,
} from "@/lib/diagram";

/**
 * The drawing of a node and of a connector, shared by the static diagram and
 * the interactive canvas so both look the same. Plain SVG, no hooks.
 */

// Strokes stay one device pixel wide at any scale or zoom.
const hairline = "non-scaling-stroke";

export type ShapeState = "idle" | "active" | "dimmed";

const frame: Record<NodeKind, string> = {
  service: "fill-raised stroke-line-strong",
  store: "fill-raised stroke-line-strong",
  topic: "fill-surface stroke-signal-info",
  actor: "fill-surface stroke-line-strong",
  external: "fill-canvas stroke-line-strong",
};

const dashes: Partial<Record<NodeKind, string>> = {
  actor: "5 4",
  external: "2 3",
};

type NodeShapeProps = {
  node: Pick<DiagramNode, "kind" | "label" | "sublabel" | "w" | "h">;
  state?: ShapeState;
};

/** A node drawn at the origin of its own coordinate space. */
export function NodeShape({ node, state = "idle" }: NodeShapeProps) {
  const { kind, label, sublabel, w, h } = node;
  const centered = kind === "topic";
  const tall = h > 96;
  const x = centered ? w / 2 : 12;
  // Two lines centered in the box; a tall box keeps them at the top.
  const labelY = tall ? 26 : sublabel ? h / 2 - 3 : h / 2 + 5;
  const active = state === "active";

  return (
    <g
      className={state === "dimmed" ? "opacity-40" : undefined}
      style={{ transition: "opacity 150ms" }}
    >
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={centered ? (h - 1) / 2 : 6}
        className={active ? "fill-accent-soft stroke-accent" : frame[kind]}
        strokeDasharray={active ? undefined : dashes[kind]}
        vectorEffect={hairline}
      />
      {kind === "store" ? (
        <line
          x1={0.5}
          x2={w - 0.5}
          y1={7}
          y2={7}
          className={active ? "stroke-accent" : "stroke-line-strong"}
          vectorEffect={hairline}
        />
      ) : null}
      <text
        x={x}
        y={labelY}
        textAnchor={centered ? "middle" : "start"}
        className={
          centered
            ? "fill-signal-info font-mono text-[12px]"
            : kind === "external"
              ? "fill-fg-muted text-[14px] font-medium"
              : "fill-fg text-[14px] font-medium"
        }
      >
        {label}
      </text>
      {sublabel ? (
        <text
          x={x}
          y={labelY + 17}
          textAnchor={centered ? "middle" : "start"}
          className="fill-fg-subtle font-mono text-[11px]"
        >
          {sublabel}
        </text>
      ) : null}
    </g>
  );
}

const stroke: Record<EdgeKind, string> = {
  request: "stroke-fg-subtle",
  event: "stroke-signal-info",
  read: "stroke-fg-subtle",
};

const fill: Record<EdgeKind, string> = {
  request: "fill-fg-subtle",
  event: "fill-signal-info",
  read: "fill-fg-subtle",
};

const edgeDashes: Partial<Record<EdgeKind, string>> = {
  event: "6 4",
  read: "2 4",
};

type EdgeShapeProps = {
  points: Point[];
  kind: EdgeKind;
  label?: string;
  state?: ShapeState;
};

/** A connector with its arrowhead and, if it has one, its label. */
export function EdgeShape({
  points,
  kind,
  label,
  state = "idle",
}: EdgeShapeProps) {
  const active = state === "active";
  const anchor = label ? labelAnchor(points) : null;

  return (
    <g
      className={state === "dimmed" ? "opacity-25" : undefined}
      style={{ transition: "opacity 150ms" }}
    >
      <path
        d={pathData(points)}
        fill="none"
        className={active ? "stroke-accent" : stroke[kind]}
        strokeWidth={active ? 1.75 : 1}
        strokeDasharray={edgeDashes[kind]}
        vectorEffect={hairline}
      />
      <polygon
        points={arrowHead(points)}
        className={active ? "fill-accent" : fill[kind]}
      />
      {anchor && label ? (
        <text
          x={anchor.orientation === "horizontal" ? anchor.x : anchor.x + 7}
          y={anchor.orientation === "horizontal" ? anchor.y - 7 : anchor.y + 4}
          textAnchor={anchor.orientation === "horizontal" ? "middle" : "start"}
          // A halo in the background colour keeps the label legible over lines.
          paintOrder="stroke"
          strokeWidth={4}
          strokeLinejoin="round"
          className={
            active
              ? "fill-accent-text stroke-surface font-mono text-[11px]"
              : "fill-fg-muted stroke-surface font-mono text-[11px]"
          }
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

type GroupShapeProps = { w: number; h: number; label: string };

/** A dashed boundary: what runs together, on one host. */
export function GroupShape({ w, h, label }: GroupShapeProps) {
  return (
    <g>
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={10}
        fill="none"
        strokeDasharray="6 5"
        className="stroke-line-strong"
        vectorEffect={hairline}
      />
      <text
        x={14}
        y={22}
        className="fill-fg-subtle font-mono text-[11px] tracking-[0.08em] uppercase"
      >
        {label}
      </text>
    </g>
  );
}

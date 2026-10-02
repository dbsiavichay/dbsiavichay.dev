import { ChevronDown } from "lucide-react";

import { routeEdge, type Diagram, type EdgeKind } from "@/lib/diagram";

import { EdgeShape, GroupShape, NodeShape } from "./shapes";

/** Room around the drawing for strokes and arrowheads at the edges. */
const PAD = 12;

export function viewBoxOf(diagram: Diagram) {
  return {
    x: -PAD,
    y: -PAD,
    w: diagram.width + 2 * PAD,
    h: diagram.height + 2 * PAD,
  };
}

/** The diagram as a static SVG: part of the page, no script needed. */
export function DiagramDrawing({
  diagram,
  label,
}: {
  diagram: Diagram;
  label: string;
}) {
  const box = viewBoxOf(diagram);
  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full font-sans"
    >
      {diagram.groups.map((group) => (
        <g key={group.id} transform={`translate(${group.x} ${group.y})`}>
          <GroupShape w={group.w} h={group.h} label={group.label} />
        </g>
      ))}
      {diagram.edges.map((edge) => (
        <EdgeShape
          key={edge.id}
          points={routeEdge(diagram, edge)}
          kind={edge.kind}
          label={edge.label}
        />
      ))}
      {diagram.nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <NodeShape node={node} />
        </g>
      ))}
    </svg>
  );
}

const sample: Record<EdgeKind, string | undefined> = {
  request: undefined,
  event: "6 4",
  read: "2 4",
};

const sampleStroke: Record<EdgeKind, string> = {
  request: "stroke-fg-subtle",
  event: "stroke-signal-info",
  read: "stroke-fg-subtle",
};

/** What each kind of connector means, for the kinds this diagram uses. */
export function DiagramLegend({
  diagram,
  labels,
}: {
  diagram: Diagram;
  labels: Record<EdgeKind, string>;
}) {
  const kinds = (["request", "event", "read"] as const).filter((kind) =>
    diagram.edges.some((edge) => edge.kind === kind),
  );
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-fg-subtle">
      {kinds.map((kind) => (
        <li key={kind} className="flex items-center gap-2">
          <svg aria-hidden="true" viewBox="0 0 24 8" className="h-2 w-6">
            <line
              x1="0"
              y1="4"
              x2="24"
              y2="4"
              strokeDasharray={sample[kind]}
              className={sampleStroke[kind]}
            />
          </svg>
          {labels[kind]}
        </li>
      ))}
    </ul>
  );
}

type DiagramTextProps = {
  diagram: Diagram;
  labels: {
    text: string;
    connections: string;
    legend: Record<EdgeKind, string>;
  };
};

/** Everything the drawing says, as text: for screen readers, and for anyone. */
export function DiagramText({ diagram, labels }: DiagramTextProps) {
  const names = new Map(diagram.nodes.map((node) => [node.id, node.label]));
  return (
    <details className="group border-t border-line">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 label-mono text-fg-muted transition-colors hover:text-fg sm:px-5 [&::-webkit-details-marker]:hidden">
        {labels.text}
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-fg-subtle transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="grid gap-8 px-4 pb-6 sm:px-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <dl className="grid content-start gap-4">
          {diagram.nodes.map((node) => (
            <div key={node.id}>
              <dt className="text-sm font-medium text-fg">
                {node.label}
                {node.sublabel ? (
                  <span className="ml-2 font-mono text-xs font-normal text-fg-subtle">
                    {node.sublabel}
                  </span>
                ) : null}
              </dt>
              <dd className="mt-1 text-sm text-fg-muted">{node.detail}</dd>
            </div>
          ))}
        </dl>
        <div>
          <p className="label-mono text-fg-subtle">{labels.connections}</p>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            {diagram.edges.map((edge) => (
              <li key={edge.id}>
                {names.get(edge.from.node)} → {names.get(edge.to.node)}
                <span className="text-fg-subtle">
                  {" · "}
                  {edge.label ?? labels.legend[edge.kind]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

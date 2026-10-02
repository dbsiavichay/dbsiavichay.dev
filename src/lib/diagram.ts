import type { Locale } from "@/i18n/config";
import type { Localized } from "@/i18n/localized";

/**
 * Architecture diagrams as data. The same definition is drawn twice: as a
 * static SVG that is part of the page, and as an interactive canvas (React
 * Flow) loaded only when a reader asks for it. Both route their connectors
 * with `route`, so the two drawings match line for line.
 */

export type Side = "top" | "right" | "bottom" | "left";

export type Box = { x: number; y: number; w: number; h: number };

export type Point = { x: number; y: number };

/**
 * `service`: something we run. `store`: where data lives. `topic`: a Kafka
 * topic or queue. `actor`: a person and their device. `external`: a system
 * outside our control.
 */
export type NodeKind = "service" | "store" | "topic" | "actor" | "external";

/** `request`: a call that waits for an answer. `event`: a message on a queue. `read`: read-only access. */
export type EdgeKind = "request" | "event" | "read";

export type DiagramNode<T = string> = Box & {
  id: string;
  kind: NodeKind;
  label: T;
  /** One short line under the label. */
  sublabel?: T;
  /** What the component does, for the text version and the inspector. */
  detail: T;
};

export type DiagramGroup<T = string> = Box & { id: string; label: T };

/** Where a connector meets a node: a side, and how far along it (0–1). */
export type EdgeEnd = { node: string; side: Side; at?: number };

export type DiagramEdge<T = string> = {
  id: string;
  from: EdgeEnd;
  to: EdgeEnd;
  kind: EdgeKind;
  label?: T;
  /** Where a two-bend connector turns, between its ends (0–1). */
  bend?: number;
};

export type Diagram<T = string> = {
  id: string;
  /** Names the variant when a figure has more than one. */
  name: T;
  width: number;
  height: number;
  groups: DiagramGroup<T>[];
  nodes: DiagramNode<T>[];
  edges: DiagramEdge<T>[];
};

export type DiagramFigure<T = string> = {
  id: string;
  title: T;
  caption: T;
  variants: Diagram<T>[];
};

/** The point where a connector meets a box. */
export function anchor(box: Box, side: Side, at = 0.5): Point {
  switch (side) {
    case "top":
      return { x: box.x + box.w * at, y: box.y };
    case "bottom":
      return { x: box.x + box.w * at, y: box.y + box.h };
    case "left":
      return { x: box.x, y: box.y + box.h * at };
    case "right":
      return { x: box.x + box.w, y: box.y + box.h * at };
  }
}

/** How far a connector clears the boxes when it has to go around them. */
const CLEARANCE = 24;

const isHorizontal = (side: Side) => side === "left" || side === "right";

/**
 * An orthogonal route between two anchors, with at most two bends: the way a
 * connector is drawn on a technical diagram.
 */
export function route(
  from: Point,
  fromSide: Side,
  to: Point,
  toSide: Side,
  bend = 0.5,
): Point[] {
  if (isHorizontal(fromSide) && isHorizontal(toSide)) {
    const facing =
      fromSide !== toSide &&
      (fromSide === "right" ? to.x > from.x : to.x < from.x);
    const x = facing
      ? from.x + (to.x - from.x) * bend
      : fromSide === "right"
        ? Math.max(from.x, to.x) + CLEARANCE
        : Math.min(from.x, to.x) - CLEARANCE;
    return simplify([from, { x, y: from.y }, { x, y: to.y }, to]);
  }
  if (!isHorizontal(fromSide) && !isHorizontal(toSide)) {
    const facing =
      fromSide !== toSide &&
      (fromSide === "bottom" ? to.y > from.y : to.y < from.y);
    const y = facing
      ? from.y + (to.y - from.y) * bend
      : fromSide === "bottom"
        ? Math.max(from.y, to.y) + CLEARANCE
        : Math.min(from.y, to.y) - CLEARANCE;
    return simplify([from, { x: from.x, y }, { x: to.x, y }, to]);
  }
  return simplify(
    isHorizontal(fromSide)
      ? [from, { x: to.x, y: from.y }, to]
      : [from, { x: from.x, y: to.y }, to],
  );
}

// Anchors measured by the browser can be off by a fraction of a pixel.
const same = (a: number, b: number) => Math.abs(a - b) < 0.5;

/** Without repeated points or collinear corners. */
function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const point of points) {
    const last = out.at(-1);
    if (last && same(last.x, point.x) && same(last.y, point.y)) continue;
    const before = out.at(-2);
    if (
      before &&
      last &&
      ((same(before.x, last.x) && same(last.x, point.x)) ||
        (same(before.y, last.y) && same(last.y, point.y)))
    ) {
      out[out.length - 1] = point;
    } else {
      out.push(point);
    }
  }
  return out;
}

export function pathData(points: Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`)
    .join(" ");
}

/** Where an edge's label goes: the middle of its longest segment. */
export function labelAnchor(points: Point[]): Point & {
  orientation: "horizontal" | "vertical";
} {
  let best = { length: -1, x: 0, y: 0, horizontal: true };
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length > best.length) {
      best = {
        length,
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        horizontal: same(a.y, b.y),
      };
    }
  }
  return {
    x: best.x,
    y: best.y,
    orientation: best.horizontal ? "horizontal" : "vertical",
  };
}

/** A closed arrowhead whose tip is the route's last point. */
export function arrowHead(points: Point[], size = 7): string {
  const tip = points.at(-1)!;
  const from = points.at(-2) ?? tip;
  const length = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const ux = (tip.x - from.x) / length;
  const uy = (tip.y - from.y) / length;
  const bx = tip.x - ux * size;
  const by = tip.y - uy * size;
  const half = size * 0.55;
  return [
    [tip.x, tip.y],
    [bx - uy * half, by + ux * half],
    [bx + uy * half, by - ux * half],
  ]
    .map(([x, y]) => `${round(x!)},${round(y!)}`)
    .join(" ");
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The route of an edge between the nodes it joins, as drawn statically. */
export function routeEdge(diagram: Diagram, edge: DiagramEdge): Point[] {
  const box = (id: string) => {
    const node = diagram.nodes.find((n) => n.id === id);
    if (!node) throw new Error(`edge ${edge.id} joins a missing node: ${id}`);
    return node;
  };
  return route(
    anchor(box(edge.from.node), edge.from.side, edge.from.at),
    edge.from.side,
    anchor(box(edge.to.node), edge.to.side, edge.to.at),
    edge.to.side,
    edge.bend,
  );
}

/** The edges that touch a node, in both directions. */
export function edgesOf(diagram: Diagram, nodeId: string): DiagramEdge[] {
  return diagram.edges.filter(
    (edge) => edge.from.node === nodeId || edge.to.node === nodeId,
  );
}

/** A figure with its text in one language. */
export function localizeFigure(
  figure: DiagramFigure<Localized>,
  locale: Locale,
): DiagramFigure {
  return {
    id: figure.id,
    title: figure.title[locale],
    caption: figure.caption[locale],
    variants: figure.variants.map((diagram) => ({
      ...diagram,
      name: diagram.name[locale],
      groups: diagram.groups.map((group) => ({
        ...group,
        label: group.label[locale],
      })),
      nodes: diagram.nodes.map((node) => ({
        ...node,
        label: node.label[locale],
        sublabel: node.sublabel?.[locale],
        detail: node.detail[locale],
      })),
      edges: diagram.edges.map((edge) => ({
        ...edge,
        label: edge.label?.[locale],
      })),
    })),
  };
}

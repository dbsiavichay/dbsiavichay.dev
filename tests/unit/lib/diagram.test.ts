import { describe, expect, it } from "vitest";

import { diagrams } from "@/data/diagrams";
import { locales } from "@/i18n/config";
import {
  anchor,
  arrowHead,
  labelAnchor,
  localizeFigure,
  route,
  routeEdge,
  type Box,
  type Point,
} from "@/lib/diagram";

const box: Box = { x: 100, y: 50, w: 200, h: 80 };

describe("anchor", () => {
  it("puts a point on the side of a box, at a share of its length", () => {
    expect(anchor(box, "top")).toEqual({ x: 200, y: 50 });
    expect(anchor(box, "right", 0.25)).toEqual({ x: 300, y: 70 });
    expect(anchor(box, "bottom", 0)).toEqual({ x: 100, y: 130 });
    expect(anchor(box, "left")).toEqual({ x: 100, y: 90 });
  });
});

describe("route", () => {
  it("is a straight line between aligned anchors", () => {
    expect(route({ x: 0, y: 10 }, "right", { x: 50, y: 10 }, "left")).toEqual([
      { x: 0, y: 10 },
      { x: 50, y: 10 },
    ]);
  });

  it("turns twice, halfway, between facing anchors", () => {
    expect(route({ x: 0, y: 0 }, "right", { x: 100, y: 40 }, "left")).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 40 },
      { x: 100, y: 40 },
    ]);
    expect(
      route({ x: 0, y: 0 }, "bottom", { x: 60, y: 100 }, "top", 0.25),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 25 },
      { x: 60, y: 25 },
      { x: 60, y: 100 },
    ]);
  });

  it("goes around when both anchors are on the same side", () => {
    expect(route({ x: 300, y: 100 }, "top", { x: 50, y: 100 }, "top")).toEqual([
      { x: 300, y: 100 },
      { x: 300, y: 76 },
      { x: 50, y: 76 },
      { x: 50, y: 100 },
    ]);
  });

  it("turns once from a side to a perpendicular side", () => {
    expect(route({ x: 0, y: 0 }, "right", { x: 80, y: 60 }, "top")).toEqual([
      { x: 0, y: 0 },
      { x: 80, y: 0 },
      { x: 80, y: 60 },
    ]);
  });
});

describe("arrowHead and labelAnchor", () => {
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 0, y: 10 },
    { x: 100, y: 10 },
  ];

  it("points the arrow at the last point", () => {
    expect(arrowHead(points).split(" ")[0]).toBe("100,10");
  });

  it("labels the middle of the longest segment", () => {
    expect(labelAnchor(points)).toEqual({
      x: 50,
      y: 10,
      orientation: "horizontal",
    });
  });
});

// Approximate advance widths of the diagram's fonts, in diagram units.
const SANS_14 = 7.8;
const MONO_12 = 7.2;
const MONO_11 = 6.6;

/** Whether an orthogonal segment passes through the inside of a box. */
function crosses(a: Point, b: Point, target: Box, margin = 1) {
  const inner = {
    x1: target.x + margin,
    y1: target.y + margin,
    x2: target.x + target.w - margin,
    y2: target.y + target.h - margin,
  };
  const [x1, x2] = [Math.min(a.x, b.x), Math.max(a.x, b.x)];
  const [y1, y2] = [Math.min(a.y, b.y), Math.max(a.y, b.y)];
  return x1 < inner.x2 && x2 > inner.x1 && y1 < inner.y2 && y2 > inner.y1;
}

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const contains = (outer: Box, inner: Box) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h;

const figures = Object.values(diagrams).flatMap((figure) =>
  locales.map((locale) => localizeFigure(figure, locale)),
);

const variants = figures.flatMap((figure) =>
  figure.variants.map((diagram) => ({
    name: `${figure.title} — ${diagram.name}`,
    diagram,
  })),
);

describe.each(variants)("$name", ({ diagram }) => {
  it("has unique ids and edges between nodes that exist", () => {
    const ids = diagram.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const edge of diagram.edges) {
      expect(ids, edge.id).toContain(edge.from.node);
      expect(ids, edge.id).toContain(edge.to.node);
    }
  });

  it("keeps every node on the canvas, apart, and in or out of each group", () => {
    const canvas = { x: 0, y: 0, w: diagram.width, h: diagram.height };
    for (const [i, node] of diagram.nodes.entries()) {
      expect(contains(canvas, node), node.id).toBe(true);
      for (const other of diagram.nodes.slice(i + 1)) {
        expect(overlap(node, other), `${node.id} / ${other.id}`).toBe(false);
      }
      for (const group of diagram.groups) {
        expect(
          contains(group, node) || !overlap(group, node),
          `${node.id} straddles ${group.id}`,
        ).toBe(true);
      }
    }
  });

  it("routes no connector through a node it doesn't join", () => {
    for (const edge of diagram.edges) {
      const points = routeEdge(diagram, edge);
      for (const node of diagram.nodes) {
        if (node.id === edge.from.node || node.id === edge.to.node) continue;
        for (let i = 1; i < points.length; i++) {
          expect(
            crosses(points[i - 1]!, points[i]!, node),
            `${edge.id} crosses ${node.id}`,
          ).toBe(false);
        }
      }
    }
  });

  it("fits each label and sublabel on one line of its box", () => {
    for (const node of diagram.nodes) {
      const centered = node.kind === "topic";
      const room = node.w - (centered ? 16 : 24);
      const labelWidth = node.label.length * (centered ? MONO_12 : SANS_14);
      expect(labelWidth, node.label).toBeLessThanOrEqual(room);
      if (node.sublabel) {
        expect(
          node.sublabel.length * MONO_11,
          node.sublabel,
        ).toBeLessThanOrEqual(room);
      }
    }
  });

  it("describes every component", () => {
    for (const node of diagram.nodes) {
      expect(node.detail.length, node.id).toBeGreaterThan(20);
    }
  });
});

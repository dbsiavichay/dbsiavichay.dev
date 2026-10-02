"use client";

import dynamic from "next/dynamic";

/*
 * The interactive figures of case studies and notes, split into their own
 * chunks. Every page that lists projects imports the MDX files for their
 * `meta`, and with them these components: without the split, their code
 * would ship with every page. Still rendered on the server.
 */

export const CutPlanViewer = dynamic(() =>
  import("@/components/maderable/cut-plan-viewer").then(
    (mod) => mod.CutPlanViewer,
  ),
);

export const OrderPipeline = dynamic(() =>
  import("@/components/maderable/order-pipeline").then(
    (mod) => mod.OrderPipeline,
  ),
);

export const DiagramFigure = dynamic(() =>
  import("@/components/architecture/diagram-figure").then(
    (mod) => mod.DiagramFigure,
  ),
);

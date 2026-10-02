"use client";

import { Move, PenLine } from "lucide-react";
import { lazy, Suspense, useId, useState } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";
import type { DiagramFigure as Figure } from "@/lib/diagram";

import {
  DiagramDrawing,
  DiagramLegend,
  DiagramText,
  viewBoxOf,
} from "./diagram-drawing";

// React Flow only downloads when a reader asks to explore.
const FlowCanvas = lazy(() => import("./flow-canvas"));

function preload() {
  void import("./flow-canvas");
}

type DiagramFigureProps = {
  figure: Figure;
  labels: Dictionary["diagram"];
  /** Computed on the server with `buttonStyles()`. */
  buttonClassName: string;
};

/**
 * An architecture diagram: a static drawing that is part of the page, and an
 * "Explore" button that swaps in the same diagram with pan, zoom and an
 * inspector. Figures with several variants (before and after) switch between
 * them in either mode.
 */
export function DiagramFigure({
  figure,
  labels,
  buttonClassName,
}: DiagramFigureProps) {
  const [variantId, setVariantId] = useState(figure.variants[0]!.id);
  const [interactive, setInteractive] = useState(false);
  const titleId = useId();

  const diagram =
    figure.variants.find((variant) => variant.id === variantId) ??
    figure.variants[0]!;
  const box = viewBoxOf(diagram);
  const name =
    figure.variants.length > 1
      ? `${figure.title} — ${diagram.name}`
      : figure.title;

  const drawing = (
    <div
      role="group"
      aria-label={labels.scroll}
      tabIndex={0}
      className="overflow-x-auto"
    >
      <div className="min-w-xl p-4 sm:p-5">
        <DiagramDrawing diagram={diagram} label={name} />
      </div>
    </div>
  );

  return (
    <figure
      aria-labelledby={titleId}
      className="not-prose my-12 overflow-hidden rounded-lg border border-line bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3 sm:px-5">
        <p id={titleId} className="label-mono text-fg">
          {figure.title}
        </p>
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setInteractive((value) => !value)}
          onPointerEnter={preload}
          onFocus={preload}
        >
          {interactive ? (
            <>
              <PenLine aria-hidden="true" />
              {labels.close}
            </>
          ) : (
            <>
              <Move aria-hidden="true" />
              {labels.explore}
              <span className="font-normal text-fg-subtle max-sm:hidden">
                · {labels.exploreHint}
              </span>
            </>
          )}
        </button>
      </div>

      {figure.variants.length > 1 ? (
        <div
          role="group"
          aria-label={labels.variants}
          className="flex flex-wrap gap-1 border-b border-line px-4 py-2 sm:px-5"
        >
          {figure.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              aria-pressed={variant.id === diagram.id}
              onClick={() => setVariantId(variant.id)}
              className="min-h-9 rounded-sm px-3 py-1.5 text-left font-mono text-xs text-fg-muted transition-colors hover:text-fg aria-pressed:bg-raised aria-pressed:text-fg"
            >
              {variant.name}
            </button>
          ))}
        </div>
      ) : null}

      {interactive ? (
        <Suspense fallback={drawing}>
          <FlowCanvas
            key={diagram.id}
            diagram={diagram}
            labels={labels}
            aspectRatio={box.w / box.h}
          />
        </Suspense>
      ) : (
        drawing
      )}

      <div className="border-t border-line px-4 py-3 sm:px-5">
        <DiagramLegend diagram={diagram} labels={labels.legend} />
      </div>
      <DiagramText diagram={diagram} labels={labels} />
      <figcaption className="border-t border-line px-4 py-3 text-sm text-fg-subtle sm:px-5">
        {figure.caption}
      </figcaption>
    </figure>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import type { Dictionary } from "@/i18n/get-dictionary";

export type PipelineActivity = {
  id: string;
  name: string;
  actor: string;
  rule: string;
};

export type PipelineStage = {
  id: string;
  state: string;
  name: string;
  actor: string;
  summary: string;
  rule: string;
  inventory?: string;
  activities?: PipelineActivity[];
};

type OrderPipelineProps = {
  stages: PipelineStage[];
  labels: Dictionary["pipeline"];
};

// Illustrative spans for the parallel activities, as shares of the stage:
// banding starts after the first banded piece is cut and ends after the last.
const spans: Record<string, [number, number]> = {
  cutting: [0, 72],
  banding: [18, 100],
  additional: [26, 84],
};

const format = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

/**
 * The life of a job, one stage at a time. A tab list: arrow keys, Home and
 * End move between stages; every panel is in the page, only one is shown.
 */
export function OrderPipeline({ stages, labels }: OrderPipelineProps) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const last = stages.length - 1;
  // Each stage gets a column; the rail runs between the first and last centres.
  const columns = {
    gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
  };
  const inset = `calc(100% / ${stages.length * 2})`;
  const progress = `calc((100% - 2 * ${inset}) * ${index / last})`;

  function go(next: number, focus = false) {
    const target = Math.min(Math.max(next, 0), last);
    setIndex(target);
    if (focus) tabs.current[target]?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    go(next, true);
  }

  return (
    <figure className="not-prose my-12 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
        <p className="label-mono text-fg">{labels.title}</p>
        <p className="font-mono text-xs text-fg-subtle">
          {format(labels.stageOf, { n: index + 1, total: stages.length })}
        </p>
      </div>

      <div className="px-4 pt-5 sm:px-5">
        {/* The inventory sits beside the flow, feeding the quote only. */}
        <div aria-hidden="true" className="relative mb-1 hidden pb-5 sm:block">
          <span className="inline-block rounded-sm border border-dashed border-line-strong bg-canvas px-2 py-1 font-mono text-[11px] text-fg-muted">
            {labels.inventoryLane}
          </span>
          <span
            className="absolute bottom-0 h-5 border-l border-dotted border-fg-subtle"
            style={{ left: inset }}
          />
        </div>

        <div
          role="tablist"
          aria-label={labels.stages}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="relative grid"
          style={columns}
        >
          <span
            aria-hidden="true"
            className="absolute top-4 h-px bg-line-strong"
            style={{ left: inset, right: inset }}
          />
          <span
            aria-hidden="true"
            className="absolute top-4 h-px bg-accent transition-[width] duration-300"
            style={{ left: inset, width: progress }}
          />
          {stages.map((stage, i) => {
            const selected = i === index;
            return (
              <button
                key={stage.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${stage.id}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${stage.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(i)}
                className="group relative flex min-h-11 flex-col items-center gap-2 rounded-sm px-0.5 pb-2"
              >
                <span
                  aria-hidden="true"
                  className={
                    selected
                      ? "relative grid size-8 place-items-center rounded-full border border-accent bg-accent font-mono text-xs font-medium text-on-accent"
                      : i < index
                        ? "relative grid size-8 place-items-center rounded-full border border-accent bg-surface font-mono text-xs text-accent-text"
                        : "relative grid size-8 place-items-center rounded-full border border-line-strong bg-surface font-mono text-xs text-fg-muted transition-colors group-hover:border-fg-muted"
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={
                    selected
                      ? "text-center text-xs leading-tight font-medium text-fg max-sm:sr-only"
                      : "text-center text-xs leading-tight text-fg-muted group-hover:text-fg max-sm:sr-only"
                  }
                >
                  {stage.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {stages.map((stage, i) => (
        <div
          key={stage.id}
          role="tabpanel"
          id={`${id}-panel-${stage.id}`}
          aria-labelledby={`${id}-tab-${stage.id}`}
          hidden={i !== index}
          className="border-t border-line px-4 py-5 sm:px-5"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-lg font-semibold text-fg">{stage.name}</p>
            <code className="rounded-sm border border-line bg-canvas px-1.5 py-0.5 font-mono text-xs text-fg-muted">
              {stage.state}
            </code>
          </div>
          <p className="mt-2 text-base text-fg-muted">{stage.summary}</p>

          <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="label-mono text-fg-subtle">{labels.actor}</dt>
            <dd className="-mt-3 text-fg sm:mt-0">{stage.actor}</dd>
            <dt className="label-mono text-fg-subtle">{labels.rule}</dt>
            <dd className="-mt-3 text-fg-muted sm:mt-0">{stage.rule}</dd>
            {stage.inventory ? (
              <>
                <dt className="label-mono text-fg-subtle">
                  {labels.inventory}
                </dt>
                <dd className="-mt-3 text-fg-muted sm:mt-0">
                  {stage.inventory}
                </dd>
              </>
            ) : null}
          </dl>

          {stage.activities ? (
            <div className="mt-6">
              <p className="label-mono text-fg-subtle">{labels.activities}</p>
              <ul className="mt-3 space-y-4">
                {stage.activities.map((activity) => {
                  const [from, to] = spans[activity.id] ?? [0, 100];
                  return (
                    <li key={activity.id} className="text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-medium text-fg">
                          {activity.name}
                        </span>
                        <span className="font-mono text-xs text-fg-subtle">
                          {activity.actor}
                        </span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="relative mt-2 h-1.5 rounded-full bg-line"
                      >
                        <span
                          className="absolute inset-y-0 rounded-full bg-fg-subtle"
                          style={{ left: `${from}%`, width: `${to - from}%` }}
                        />
                      </div>
                      <p className="mt-2 text-fg-muted">{activity.rule}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ))}

      {/* Below sm the full labels don't fit side by side on one line; the
          accessible name stays the full label. */}
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={labels.previous}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm whitespace-nowrap text-fg transition-colors hover:bg-raised disabled:opacity-40 [&_svg]:size-4"
        >
          <ChevronLeft aria-hidden="true" />
          <span className="sm:hidden">{labels.previousShort}</span>
          <span className="max-sm:hidden">{labels.previous}</span>
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label={labels.next}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm whitespace-nowrap text-fg transition-colors hover:bg-raised disabled:opacity-40 [&_svg]:size-4"
        >
          <span className="sm:hidden">{labels.nextShort}</span>
          <span className="max-sm:hidden">{labels.next}</span>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <figcaption className="border-t border-line px-4 py-3 text-sm text-fg-subtle sm:px-5">
        {labels.caption}
      </figcaption>
    </figure>
  );
}

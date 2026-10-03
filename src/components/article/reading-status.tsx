"use client";

import { useEffect, useState } from "react";

import { activeSection, rulerPosition } from "@/lib/reading-position";

/**
 * Follows the reading position. The contents link of the section being read
 * gets `aria-current="location"` (its cursorline is CSS), and a status line
 * shows where it is, like Vim's. A small island that only articles load.
 */
export function ReadingStatus({ ids }: { ids: string[] }) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const headings = ids.map((id) => document.getElementById(id));
    let frame = 0;

    function update() {
      frame = 0;
      const root = document.documentElement;
      const atEnd =
        root.scrollTop + window.innerHeight >= root.scrollHeight - 2;
      setActive(
        activeSection(
          headings.map((h) => h?.getBoundingClientRect().top ?? Infinity),
          window.innerHeight * 0.3,
          atEnd && root.scrollTop > 0,
        ),
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  useEffect(() => {
    const current = active < 0 ? null : `#${ids[active]}`;
    for (const link of document.querySelectorAll("[data-toc] a")) {
      if (link.getAttribute("href") === current) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }, [active, ids]);

  return (
    <p aria-hidden="true" className="mt-6 flex h-6 font-mono text-xs">
      <span className="flex items-center bg-accent px-2 font-semibold text-on-accent">
        NORMAL
      </span>
      <span className="flex items-center bg-raised px-2.5 text-fg-muted">
        {rulerPosition(active, ids.length)}
      </span>
    </p>
  );
}

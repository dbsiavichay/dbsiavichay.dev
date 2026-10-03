/**
 * The section being read: the last heading that has crossed the reading line,
 * or -1 above the first one. At the end of the page the last section is the
 * one being read, even when it is too short for its heading to reach the line.
 */
export function activeSection(
  headingTops: readonly number[],
  readingLine: number,
  atEnd = false,
): number {
  if (atEnd && headingTops.length > 0) return headingTops.length - 1;
  let active = -1;
  headingTops.forEach((top, i) => {
    if (top <= readingLine) active = i;
  });
  return active;
}

/** Vim's ruler: "Top" above the first section, then "02/08". */
export function rulerPosition(active: number, total: number): string {
  if (active < 0) return "Top";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(active + 1)}/${pad(total)}`;
}

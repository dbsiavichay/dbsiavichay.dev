import { localeTags, type Locale } from "@/i18n/config";

/**
 * Formats "2021" as "2021" and "2021-10" as "Oct 2021" / "oct 2021".
 * Months are only shown where a source gives them.
 */
export function formatPartialDate(value: string, locale: Locale): string {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value);
  if (!match) throw new Error(`Expected YYYY or YYYY-MM, got "${value}"`);
  const [, year, month] = match;
  if (!month) return year!;
  return new Intl.DateTimeFormat(localeTags[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
}

/** "2019 – 2021", or a single year when a period starts and ends in the same one. */
export function formatYearRange(
  start: number,
  end: number | "present",
  presentLabel: string,
): string {
  if (end === start) return String(start);
  return `${start} – ${end === "present" ? presentLabel : end}`;
}

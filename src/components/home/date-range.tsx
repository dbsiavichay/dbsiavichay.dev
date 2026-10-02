import { Pending } from "@/components/ui/pending";
import type { DateRange as Range } from "@/data/experience";
import type { Locale } from "@/i18n/config";
import { formatPartialDate } from "@/lib/dates";
import {
  isPending,
  shouldShowPending,
  type Pending as PendingValue,
} from "@/lib/pending";

type DateRangeProps = {
  range: Range;
  locale: Locale;
  presentLabel: string;
};

function Edge({
  value,
  locale,
}: {
  value: string | PendingValue;
  locale: Locale;
}) {
  if (isPending(value)) return <Pending value={value} />;
  return <time dateTime={value}>{formatPartialDate(value, locale)}</time>;
}

/**
 * "Oct 2021 – Sep 2023". In production a range with an unconfirmed edge is
 * not shown at all: a lone "2008" would read as a graduation year, and a lone
 * start month as a single month.
 */
export function DateRange({ range, locale, presentLabel }: DateRangeProps) {
  const { start, end } = range;
  const unconfirmed = isPending(start) || isPending(end);
  if (unconfirmed && !shouldShowPending()) return null;
  if (end === start) return <Edge value={start} locale={locale} />;

  return (
    <>
      <Edge value={start} locale={locale} />
      {" – "}
      {end === "present" ? presentLabel : <Edge value={end} locale={locale} />}
    </>
  );
}

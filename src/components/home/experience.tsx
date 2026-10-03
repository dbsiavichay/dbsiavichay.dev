import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pending, PendingList } from "@/components/ui/pending";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { education, experience } from "@/data/experience";
import type { Locale } from "@/i18n/config";
import type { Localized } from "@/i18n/localized";
import { getI18n } from "@/i18n/server";
import { isPending, shouldShowPending, type Confirmable } from "@/lib/pending";
import { SEPARATOR } from "@/lib/separator";

import { DateRange } from "./date-range";
import type { EvidenceContext } from "./evidence";
import { EvidenceLinks } from "./evidence-links";

function Text({
  value,
  locale,
}: {
  value: Confirmable<Localized>;
  locale: Locale;
}) {
  return isPending(value) ? <Pending value={value} /> : value[locale];
}

export async function Experience({ evidence }: { evidence: EvidenceContext }) {
  const { locale, dict } = await getI18n();
  const t = dict.experience;
  // A job whose employer is not confirmed is not published at all.
  const entries = experience.filter(
    (entry) => !isPending(entry.organization) || shouldShowPending(),
  );

  return (
    <Section id="experience" labelledBy="experience-title">
      <SectionHeader
        index="05"
        eyebrow={t.eyebrow}
        titleId="experience-title"
        title={t.title}
        lede={t.lede}
      />
      <ol>
        {entries.map((entry) => (
          <li
            key={entry.id}
            id={`experience-${entry.id}`}
            className="grid reveal gap-4 border-t border-line py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 lg:py-10"
          >
            <div>
              <p className="font-mono text-sm text-fg">
                <DateRange
                  range={entry.period}
                  locale={locale}
                  presentLabel={dict.common.present}
                />
              </p>
              {"context" in entry ? (
                <p className="mt-1 text-sm text-fg-subtle">
                  {entry.context[locale]}
                </p>
              ) : null}
            </div>
            <div className="max-w-3xl">
              <h3 className="text-xl font-semibold text-balance text-fg">
                <Text value={entry.role} locale={locale} />
                <span className="font-normal text-fg-muted">
                  {SEPARATOR}
                  <Text value={entry.organization} locale={locale} />
                </span>
              </h3>
              {"problem" in entry ? (
                <p className="mt-3 text-fg-muted">
                  <span className="mr-2 label-mono text-fg-subtle">
                    {t.problem}
                  </span>
                  {entry.problem[locale]}
                </p>
              ) : null}
              {entry.highlights[locale].length > 0 ? (
                <ul className="mt-4 space-y-2 text-fg-muted">
                  {entry.highlights[locale].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1 shrink-0 bg-line-strong"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.stack.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {entry.stack.map((item) => (
                    <li key={item}>
                      <Badge>{item}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.evidence.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="label-mono text-fg-subtle">
                    {t.projects}
                  </span>
                  <EvidenceLinks items={entry.evidence} context={evidence} />
                </div>
              ) : null}
              <PendingList
                values={"unconfirmed" in entry ? entry.unconfirmed : undefined}
                className="mt-5"
              />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 border-t border-line pt-10 lg:mt-16">
        <h3 className="label-mono text-fg">{t.education}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {education.map((entry) => (
            <li key={entry.id}>
              <Card className="h-full">
                <p className="font-mono text-sm text-fg-subtle">
                  <DateRange
                    range={entry.period}
                    locale={locale}
                    presentLabel={dict.common.present}
                  />
                </p>
                <p className="mt-3 text-lg font-semibold text-fg">
                  {entry.degree[locale]}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  {entry.institution[locale]}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

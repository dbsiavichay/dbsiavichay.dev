import { Card } from "@/components/ui/card";
import { Pending, PendingList } from "@/components/ui/pending";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { StackLine } from "@/components/ui/stack-line";
import { education, experience, type ExperienceEntry } from "@/data/experience";
import type { Locale } from "@/i18n/config";
import type { Localized } from "@/i18n/localized";
import { getI18n } from "@/i18n/server";
import { isPending, shouldShowPending, type Confirmable } from "@/lib/pending";
import { SEPARATOR } from "@/lib/separator";
import { cn } from "@/lib/utils";

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
  const entries: readonly ExperienceEntry[] = experience.filter(
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
            className="group relative grid gap-4 py-8 pl-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:pl-12 lg:py-10"
          >
            {/* A rail like `git log --graph`: one commit per job, filled
                while it lasts. It stays put while the entries settle. */}
            <span
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-[5px] w-px bg-line-strong group-first:top-[43px] group-last:bottom-auto group-last:h-[43px] lg:group-first:top-[51px] lg:group-last:h-[51px]"
            />
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[38px] left-0 size-[11px] rounded-full lg:top-[46px]",
                entry.period.end === "present"
                  ? "bg-accent"
                  : "border border-line-strong bg-canvas",
              )}
            />
            <div className="reveal">
              <p className="font-mono text-sm text-fg">
                <DateRange
                  range={entry.period}
                  locale={locale}
                  presentLabel={dict.common.present}
                />
              </p>
              {entry.context ? (
                <p className="mt-1 text-sm text-fg-subtle">
                  {entry.context[locale]}
                </p>
              ) : null}
            </div>
            <div className="max-w-3xl reveal">
              <h3 className="text-xl font-semibold text-balance text-fg">
                <Text value={entry.role} locale={locale} />
                <span className="font-normal text-fg-muted">
                  {SEPARATOR}
                  <Text value={entry.organization} locale={locale} />
                </span>
              </h3>
              {entry.problem ? (
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
                <StackLine items={entry.stack} className="mt-5" />
              ) : null}
              {entry.evidence.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="label-mono text-fg-subtle">
                    {t.projects}
                  </span>
                  <EvidenceLinks items={entry.evidence} context={evidence} />
                </div>
              ) : null}
              <PendingList values={entry.unconfirmed} className="mt-5" />
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

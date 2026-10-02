import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { processSteps } from "@/data/process";
import { getI18n } from "@/i18n/server";

import type { EvidenceContext } from "./evidence";
import { EvidenceLinks } from "./evidence-links";

export async function Process({ evidence }: { evidence: EvidenceContext }) {
  const { locale, dict } = await getI18n();
  const t = dict.process;

  return (
    <Section id="process" labelledBy="process-title">
      <SectionHeader
        index="04"
        eyebrow={t.eyebrow}
        titleId="process-title"
        title={t.title}
        lede={t.lede}
      />
      <ol className="grid reveal gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {processSteps.map((step, i) => (
          <li key={step.id} className="flex flex-col bg-canvas p-6 lg:p-8">
            <p
              aria-hidden="true"
              className="flex items-center gap-3 label-mono text-accent-text"
            >
              {String(i + 1).padStart(2, "0")}
              <span className="h-px flex-1 bg-line" />
            </p>
            <h3 className="mt-4 text-xl font-semibold text-fg">
              {step.title[locale]}
            </h3>
            <p className="mt-2 text-fg">{step.principle[locale]}</p>
            <div className="mt-auto pt-6">
              <p className="text-sm text-fg-muted">{step.example[locale]}</p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="label-mono text-fg-subtle">{t.example}</span>
                <EvidenceLinks items={[step.evidence]} context={evidence} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

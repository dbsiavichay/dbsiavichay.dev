import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { capabilities } from "@/data/capabilities";
import { getI18n } from "@/i18n/server";

import type { EvidenceContext } from "./evidence";
import { EvidenceLinks } from "./evidence-links";

const marks = ["A", "B", "C", "D"];

export async function Capabilities({
  evidence,
}: {
  evidence: EvidenceContext;
}) {
  const { locale, dict } = await getI18n();
  const t = dict.capabilities;

  return (
    <Section id="capabilities" labelledBy="capabilities-title">
      <SectionHeader
        index="01"
        eyebrow={t.eyebrow}
        titleId="capabilities-title"
        title={t.title}
        lede={t.lede}
      />
      {/* Open columns under a hairline: a box here would mean nothing. */}
      <ul className="grid reveal gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
        {capabilities.map((capability, i) => (
          <li
            key={capability.id}
            className="flex flex-col border-t border-line pt-6"
          >
            <span aria-hidden="true" className="label-mono text-accent-text">
              {marks[i]}
            </span>
            <h3 className="mt-4 text-xl font-semibold text-fg">
              {capability.title[locale]}
            </h3>
            <p className="mt-3 text-fg-muted">{capability.body[locale]}</p>
            <div className="mt-auto pt-8">
              <p className="label-mono text-fg-subtle">{t.evidence}</p>
              <EvidenceLinks
                items={capability.evidence}
                context={evidence}
                className="mt-2"
              />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

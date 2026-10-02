import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { stack } from "@/data/stack";
import { getI18n } from "@/i18n/server";

import { resolveEvidence, type EvidenceContext } from "./evidence";

export async function Stack({ evidence }: { evidence: EvidenceContext }) {
  const { locale, dict } = await getI18n();
  const t = dict.stack;

  return (
    <Section id="stack" labelledBy="stack-title">
      <SectionHeader
        index="06"
        eyebrow={t.eyebrow}
        titleId="stack-title"
        title={t.title}
        lede={t.lede}
      />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((group) => (
          <div key={group.id} className="reveal">
            <h3 className="border-b border-line pb-3 label-mono text-fg">
              {group.title[locale]}
            </h3>
            <ul className="mt-5 space-y-4">
              {group.items.map((item) => (
                <li key={item.name}>
                  <p className="text-fg">{item.name}</p>
                  <p className="mt-0.5 text-sm text-fg-subtle">
                    <span className="sr-only">{t.usedIn}: </span>
                    {item.usedIn
                      .map((usage) => resolveEvidence(usage, evidence).label)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

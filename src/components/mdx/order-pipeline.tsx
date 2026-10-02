import type { PipelineStage } from "@/components/maderable/order-pipeline";
import { stages } from "@/data/order-pipeline";
import { getI18n } from "@/i18n/server";

import { OrderPipeline as Pipeline } from "./islands";

/** A Maderable job from quote to dispatch, in the page's language. */
export async function OrderPipeline() {
  const { locale, dict } = await getI18n();
  const localized: PipelineStage[] = stages.map((stage) => ({
    id: stage.id,
    state: stage.state,
    name: stage.name[locale],
    actor: stage.actor[locale],
    summary: stage.summary[locale],
    rule: stage.rule[locale],
    inventory: stage.inventory?.[locale],
    activities: stage.activities?.map((activity) => ({
      id: activity.id,
      name: activity.name[locale],
      actor: activity.actor[locale],
      rule: activity.rule[locale],
    })),
  }));
  return <Pipeline stages={localized} labels={dict.pipeline} />;
}

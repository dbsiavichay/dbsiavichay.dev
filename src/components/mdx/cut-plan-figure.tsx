import { CutPlanSketch } from "@/components/home/cut-plan-sketch";
import { getI18n } from "@/i18n/server";

/** The synthetic cut plan from the home page, as a figure inside a case study. */
export async function CutPlanFigure() {
  const { dict } = await getI18n();
  return (
    <CutPlanSketch
      caption={dict.work.illustration}
      labels={dict.work.illustrationLabels}
      className="my-12 rounded-lg border border-line bg-surface p-4 sm:p-6"
    />
  );
}

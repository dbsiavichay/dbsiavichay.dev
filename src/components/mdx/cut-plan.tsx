import type {
  ViewerBoard,
  ViewerItem,
} from "@/components/maderable/cut-plan-viewer";
import { billedAs, cutList, kerf, sheets, trim } from "@/data/cut-plan";
import { getI18n } from "@/i18n/server";
import { derivePlan } from "@/lib/guillotine";

import { CutPlanViewer } from "./islands";

const specs = Object.fromEntries(cutList.map((item) => [item.mark, item]));

// Laid out once, at build time: the browser only receives the geometry.
const boards: ViewerBoard[] = sheets.map((sheet) => ({
  kind: sheet.kind,
  plan: derivePlan({
    board: sheet.size,
    trim,
    kerf,
    layout: sheet.layout,
    pieces: specs,
  }),
}));

/** The synthetic cut plan, explorable, in the page's language. */
export async function CutPlan() {
  const { locale, dict } = await getI18n();
  const items: ViewerItem[] = cutList.map((item) => ({
    ...item,
    part: item.part[locale],
    board: boards.findIndex((board) =>
      board.plan.pieces.some((piece) => piece.mark === item.mark),
    ),
  }));
  return (
    <CutPlanViewer
      boards={boards}
      items={items}
      billedAs={billedAs[locale]}
      labels={dict.cutPlan}
    />
  );
}

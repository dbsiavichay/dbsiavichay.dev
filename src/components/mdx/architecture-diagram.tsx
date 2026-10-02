import { buttonStyles } from "@/components/ui/button";
import { diagrams, type DiagramId } from "@/data/diagrams";
import { getI18n } from "@/i18n/server";
import { localizeFigure } from "@/lib/diagram";

import { DiagramFigure } from "./islands";

/** One of the architecture diagrams in `src/data/diagrams.ts`, by name. */
export async function ArchitectureDiagram({ name }: { name: DiagramId }) {
  const figure = diagrams[name];
  if (!figure) throw new Error(`unknown diagram "${name}"`);
  const { locale, dict } = await getI18n();
  return (
    <DiagramFigure
      figure={localizeFigure(figure, locale)}
      labels={dict.diagram}
      buttonClassName={buttonStyles({ variant: "secondary", size: "sm" })}
    />
  );
}

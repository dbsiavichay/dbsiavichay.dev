import { TextLink } from "@/components/ui/text-link";
import type { Evidence } from "@/data/evidence";
import { cn } from "@/lib/utils";

import { resolveEvidence, type EvidenceContext } from "./evidence";

type EvidenceLinksProps = {
  items: readonly Evidence[];
  context: EvidenceContext;
  className?: string;
};

/** "Maderable · Faclab · Jüsto", each linked to where it is shown. */
export function EvidenceLinks({
  items,
  context,
  className,
}: EvidenceLinksProps) {
  const links = items.map((item) => resolveEvidence(item, context));
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-sm", className)}>
      {links.map((link) => (
        <li key={link.key}>
          {link.href ? (
            <TextLink href={link.href}>{link.label}</TextLink>
          ) : (
            <span className="text-fg-muted">{link.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

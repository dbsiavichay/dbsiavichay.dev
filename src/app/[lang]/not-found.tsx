import { ArrowLeft } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DimensionLine } from "@/components/ui/dimension-line";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { locale, dict } = await getI18n();

  return (
    <div className="flex flex-1 items-center">
      <Container className="py-section">
        <DimensionLine label="404" className="max-w-xs" />
        <h1 className="mt-8 text-3xl font-semibold text-balance">
          {dict.notFound.title}
        </h1>
        <p className="mt-4 text-lg text-fg-muted">{dict.notFound.body}</p>
        <ButtonLink href={`/${locale}`} variant="secondary" className="mt-10">
          <ArrowLeft aria-hidden="true" />
          {dict.notFound.back}
        </ButtonLink>
      </Container>
    </div>
  );
}

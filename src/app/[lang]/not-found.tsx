import { ArrowLeft } from "lucide-react";

import { CurrentPath } from "@/components/navigation/locale-switch";
import { Prompt, TerminalWindow } from "@/components/terminal/terminal-window";
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
        {/* What a shell answers. Decoration: the heading says it in words. */}
        <TerminalWindow
          as="div"
          aria-hidden="true"
          title="zsh"
          className="mt-8 max-w-xl"
        >
          <Prompt className="items-start">
            <span className="[overflow-wrap:anywhere]">
              cd <CurrentPath />
            </span>
          </Prompt>
          <p className="mt-1 [overflow-wrap:anywhere]">
            cd: no such file or directory: <CurrentPath />
          </p>
        </TerminalWindow>
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

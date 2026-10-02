import { ArrowRight, MapPin } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getI18n } from "@/i18n/server";

import { SystemStatus } from "./system-status";

export async function Hero() {
  const { locale, dict } = await getI18n();

  return (
    <section
      aria-labelledby="hero-title"
      className="border-b border-line blueprint-grid"
    >
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16 lg:py-28">
        <div>
          <p className="label-mono text-fg-subtle motion-safe:animate-rise">
            {dict.hero.eyebrow}
          </p>
          {/* The heading and lede are the LCP candidates: they never animate. */}
          <h1
            id="hero-title"
            className="mt-5 text-display font-semibold text-balance"
          >
            {dict.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-pretty text-fg-muted sm:text-xl sm:leading-relaxed">
            {dict.hero.lede}
          </p>
          <div className="mt-10 flex flex-wrap gap-3 motion-safe:animate-rise motion-safe:[animation-delay:120ms]">
            <ButtonLink href={`/${locale}#work`}>
              {dict.hero.primaryCta}
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={`/${locale}#contact`} variant="secondary">
              {dict.hero.secondaryCta}
            </ButtonLink>
          </div>
          <p className="mt-8 flex items-center gap-2 label-mono text-fg-subtle motion-safe:animate-rise motion-safe:[animation-delay:200ms]">
            <MapPin aria-hidden="true" className="size-3.5" />
            {dict.hero.location}
          </p>
        </div>
        <SystemStatus className="motion-safe:animate-rise motion-safe:[animation-delay:280ms]" />
      </Container>
    </section>
  );
}

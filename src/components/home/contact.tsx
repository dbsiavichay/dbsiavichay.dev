import { Mail } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/icons/brand-icons";
import { ButtonLink, buttonStyles } from "@/components/ui/button";
import { DimensionLine } from "@/components/ui/dimension-line";
import { Pending } from "@/components/ui/pending";
import { Section } from "@/components/ui/section";
import { SectionIndex } from "@/components/ui/section-header";
import { profile } from "@/data/profile";
import { getI18n } from "@/i18n/server";

import { CopyEmailButton } from "./copy-email-button";

export async function Contact() {
  const { dict } = await getI18n();
  const t = dict.contact;

  return (
    <Section id="contact" labelledBy="contact-title" className="blueprint-grid">
      <SectionIndex index="08" label={t.eyebrow} />
      <h2
        id="contact-title"
        className="mt-6 max-w-4xl text-display font-semibold text-balance text-fg"
      >
        {t.title}
      </h2>
      <p className="mt-6 max-w-2xl text-lede text-pretty text-fg-muted">
        {t.lede}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ButtonLink href={`mailto:${profile.email}`}>
          <Mail aria-hidden="true" />
          {t.email}
        </ButtonLink>
        <CopyEmailButton
          email={profile.email}
          label={t.copy}
          copiedLabel={t.copied}
          className={buttonStyles({ variant: "secondary" })}
        />
      </div>
      <p className="mt-5 font-mono text-sm text-fg-muted select-all">
        {profile.email}
      </p>

      <DimensionLine className="mt-14 max-w-xl" />

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="label-mono text-fg-subtle">{t.elsewhere}</p>
        <ul className="flex flex-wrap gap-2">
          <li>
            <ButtonLink href={profile.links.github} variant="ghost" size="sm">
              <GitHubIcon />
              GitHub
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href={profile.links.linkedin} variant="ghost" size="sm">
              <LinkedInIcon />
              LinkedIn
            </ButtonLink>
          </li>
        </ul>
        <Pending value={profile.resume} />
      </div>
    </Section>
  );
}

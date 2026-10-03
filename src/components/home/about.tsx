import { Pending } from "@/components/ui/pending";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { profile } from "@/data/profile";
import { getI18n } from "@/i18n/server";
import { isPending } from "@/lib/pending";
import { SEPARATOR } from "@/lib/separator";

export async function About() {
  const { locale, dict } = await getI18n();
  const t = dict.about;

  const languages = profile.languages.map((language) => ({
    key: language.name.en,
    name: language.name[locale],
    level: language.level,
  }));

  return (
    <Section id="about" labelledBy="about-title">
      <SectionHeader
        index="07"
        eyebrow={t.eyebrow}
        titleId="about-title"
        title={t.title}
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
        <div className="prose lg:order-last">
          {t.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="grid content-start gap-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-start lg:grid-cols-1">
          {/* A plain <img>: the photo is already sized and encoded (D34), and
              next/image is a Client Component that would ship JS to render it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photo.image.src}
            width={profile.photo.image.width}
            height={profile.photo.image.height}
            alt={profile.photo.alt[locale]}
            loading="lazy"
            decoding="async"
            className="h-auto w-full max-w-xs rounded-lg border border-line bg-surface"
          />
          <dl className="space-y-6 text-sm">
            <div>
              <dt className="label-mono text-fg-subtle">{t.facts.basedIn}</dt>
              <dd className="mt-1 text-fg">
                {profile.country[locale]}
                {SEPARATOR}
                {profile.timezone}
              </dd>
            </div>
            <div>
              <dt className="label-mono text-fg-subtle">{t.facts.languages}</dt>
              <dd className="mt-1 space-y-1 text-fg">
                {languages.map((language) => (
                  <p key={language.key}>
                    {language.name}
                    {isPending(language.level) ? (
                      <>
                        {" "}
                        <Pending value={language.level} />
                      </>
                    ) : (
                      <span className="text-fg-muted">
                        {" "}
                        ({language.level[locale]})
                      </span>
                    )}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label-mono text-fg-subtle">{t.facts.education}</dt>
              <dd className="mt-1 text-fg">{t.facts.educationValue}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}

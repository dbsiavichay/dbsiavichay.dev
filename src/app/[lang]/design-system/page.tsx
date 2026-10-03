// content-pending: ignore-file (shows the Pending component with a sample value)
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GitHubIcon } from "@/components/icons/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, cardLinkClass } from "@/components/ui/card";
import { DimensionLine } from "@/components/ui/dimension-line";
import { Kbd } from "@/components/ui/kbd";
import { Pending } from "@/components/ui/pending";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { pending } from "@/lib/pending";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const colorGroups = [
  {
    name: "Surfaces and text",
    tokens: [
      "canvas",
      "surface",
      "raised",
      "line",
      "line-strong",
      "fg",
      "fg-muted",
      "fg-subtle",
    ],
  },
  {
    name: "Accent: the lamp",
    tokens: ["accent", "accent-hover", "accent-text", "accent-soft", "glow"],
  },
  {
    name: "Signals, inside diagrams",
    tokens: ["signal-info", "signal-ok", "signal-error"],
  },
  {
    name: "Keycap",
    tokens: ["keycap", "keycap-pressed", "keycap-edge", "keycap-fg"],
  },
] as const;

const terminalTokens = [
  "term",
  "term-bar",
  "term-line",
  "term-line-strong",
  "term-fg",
  "term-muted",
  "term-accent",
  "term-ok",
  "syn-string",
  "syn-keyword",
  "syn-function",
  "syn-number",
  "syn-comment",
] as const;

const keys = ["esc", "g", "p", ":", "?", "/"] as const;

const typeScale = [
  ["display", "text-display font-semibold", "Systems a business runs on"],
  ["3xl", "text-3xl font-semibold", "Optimize for the invoice"],
  ["2xl", "text-2xl font-semibold", "From monolith to services"],
  ["xl", "text-xl font-medium", "Business rules where they can't be bypassed"],
  ["lede", "text-lede text-fg-muted", "The line under a display title."],
  [
    "lg",
    "text-lg text-fg-muted",
    "Long-form body copy for case studies and notes.",
  ],
  [
    "base",
    "text-base text-fg-muted",
    "Interface copy, card descriptions and lists.",
  ],
  ["sm", "text-sm text-fg-muted", "Secondary details, captions and metadata."],
  ["label-mono", "label-mono text-fg-subtle", "What I build"],
  ["path-mono", "path-mono text-fg-muted", "~/projects/maderable"],
] as const;

const spacing = [
  ["4", "w-4"],
  ["8", "w-8"],
  ["12", "w-12"],
  ["16", "w-16"],
  ["24", "w-24"],
  ["section", "w-section"],
] as const;

/**
 * A living style guide for the tokens and primitives. Development only: the
 * production build renders a 404 here.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <Section id="colors" labelledBy="colors-title" divided={false}>
        <SectionHeader
          index="00"
          eyebrow="Design system"
          titleId="colors-title"
          title="Graphite & lamp"
          lede="Warm graphite under one amber light. Dark is the design target; light follows the system preference. Text pairs are ≥ 4.5:1 and outlines ≥ 3:1, checked against globals.css by tests/unit/app/tokens.test.ts."
        />
        <div className="space-y-10">
          {colorGroups.map((group) => (
            <div key={group.name}>
              <h3 className="label-mono text-fg-subtle">{group.name}</h3>
              <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {group.tokens.map((token) => (
                  <Swatch key={token} token={token} />
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="label-mono text-fg-subtle">
              Terminal and code: dark in both themes
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {terminalTokens.map((token) => (
                <Swatch key={token} token={token} />
              ))}
            </ul>
            <figure className="mt-6 max-w-xl overflow-hidden rounded-lg border border-term-line bg-term">
              <figcaption className="border-b border-term-line bg-term-bar px-4 py-2 path-mono text-term-muted">
                tokens.ts
              </figcaption>
              <pre className="overflow-x-auto px-4 py-3 path-mono text-term-fg">
                <code>
                  <span className="text-syn-comment">
                    {"// The terminal is a screen: it stays dark."}
                  </span>
                  {"\n"}
                  <span className="text-syn-keyword">const</span> minimum ={" "}
                  <span className="text-syn-number">4.5</span>;{"\n"}
                  <span className="text-syn-keyword">export function</span>{" "}
                  <span className="text-syn-function">readable</span>(ratio){" "}
                  {"{\n  "}
                  <span className="text-syn-keyword">return</span> ratio {">="}{" "}
                  minimum ? <span className="text-syn-string">{'"AA"'}</span> :{" "}
                  <span className="text-syn-string">{'"fail"'}</span>;
                  {"\n}\n\n"}
                  <span className="text-term-accent">$</span> npm run test
                  {"\n"}
                  <span className="text-term-ok">tokens</span>{" "}
                  <span className="text-term-muted">checked</span>
                </code>
              </pre>
            </figure>
          </div>

          <div>
            <h3 className="label-mono text-fg-subtle">
              Keycaps, from the tokens
            </h3>
            <p className="mt-4 flex flex-wrap items-end gap-3">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-b-4 border-keycap-edge bg-keycap px-2 font-mono text-sm text-keycap-fg first:border-accent first:text-accent-text"
                >
                  {key}
                </kbd>
              ))}
              <kbd className="inline-flex h-9 min-w-9 translate-y-[3px] items-center justify-center rounded-md border border-keycap-edge bg-keycap-pressed px-2 font-mono text-sm text-keycap-fg">
                j
              </kbd>
            </p>
            <p className="mt-3 text-sm text-fg-muted">
              The last one is pressed: its edge sinks and its face darkens.
            </p>
          </div>
        </div>
      </Section>

      <Section id="type" labelledBy="type-title">
        <SectionHeader
          index="01"
          eyebrow="Typography"
          titleId="type-title"
          title="Type scale"
        />
        <ul className="space-y-6">
          {typeScale.map(([name, classes, sample]) => (
            <li
              key={name}
              className="grid gap-2 md:grid-cols-[8rem_1fr] md:items-baseline"
            >
              <span className="font-mono text-xs text-fg-subtle">{name}</span>
              <span className={classes}>{sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="spacing" labelledBy="spacing-title">
        <SectionHeader
          index="02"
          eyebrow="Spacing"
          titleId="spacing-title"
          title="Rhythm and frame"
          lede="4px base. Sections breathe with a fluid vertical rhythm; the container is 1200px wide with 16/24/32px gutters."
        />
        <ul className="space-y-3">
          {spacing.map(([name, width]) => (
            <li key={name} className="flex items-center gap-4">
              <span className="w-16 font-mono text-xs text-fg-subtle">
                {name}
              </span>
              <span className={`${width} h-3 rounded-sm bg-accent`} />
            </li>
          ))}
        </ul>
        <DimensionLine label="max-w-site · 1200px" className="mt-12" />
      </Section>

      <Section id="controls" labelledBy="controls-title">
        <SectionHeader
          index="03"
          eyebrow="Controls"
          titleId="controls-title"
          title="Buttons, links, badges"
        />
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="#controls">
            See the work
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="#controls" variant="secondary">
            Get in touch
          </ButtonLink>
          <Button variant="ghost">
            <GitHubIcon />
            GitHub
          </Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <p className="mt-8 max-w-xl text-fg-muted">
          Inline links read as{" "}
          <TextLink href="#controls">underlined text</TextLink>, and the accent
          only appears on hover. Shortcuts look like <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Badge>FastAPI</Badge>
          <Badge>PostgreSQL</Badge>
          <Badge variant="accent">Case study</Badge>
          <Badge variant="outline" dot className="text-signal-ok">
            In production
          </Badge>
          <Pending value={pending("sample of an unconfirmed fact")} />
        </div>
      </Section>

      <Section id="cards" labelledBy="cards-title">
        <SectionHeader
          index="04"
          eyebrow="Surfaces"
          titleId="cards-title"
          title="Cards"
          lede="One column on phones, a 2:1 featured layout from md, and an asymmetric grid from lg."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Card interactive className="md:col-span-2 md:row-span-2">
            <p className="label-mono text-fg-subtle">Featured</p>
            <h3 className="mt-3 text-2xl font-semibold">
              <a href="#cards" className={cardLinkClass}>
                A featured case study
              </a>
            </h3>
            <p className="mt-3 max-w-prose text-fg-muted">
              The whole card is clickable through its title link; focus draws
              the ring around the card.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Static card</h3>
            <p className="mt-2 text-sm text-fg-muted">
              Surface, hairline border, 8px radius.
            </p>
          </Card>
          <Card className="bg-raised">
            <h3 className="text-lg font-semibold">Raised</h3>
            <p className="mt-2 text-sm text-fg-muted">
              For panels that sit on a surface.
            </p>
          </Card>
        </div>
      </Section>

      <Section id="prose" labelledBy="prose-title">
        <SectionHeader
          index="05"
          eyebrow="Long form"
          titleId="prose-title"
          title="Prose"
        />
        <div className="prose">
          <p>
            Case studies are written in MDX. Paragraphs keep a comfortable
            measure, <strong>strong text</strong> lifts to the foreground
            colour, and <code>inline code</code> sits on a surface.
          </p>
          <h2>A second-level heading</h2>
          <ul>
            <li>Lists use square markers.</li>
            <li>Links are underlined, never colour alone.</li>
          </ul>
          <blockquote>
            A rule that matters lives where no code path can skip it.
          </blockquote>
          <pre>
            <code>
              {"POST /api/v1/optimize\n→ 200 { boards, cost, unplaced }"}
            </code>
          </pre>
        </div>
      </Section>
    </>
  );
}

/** One token, painted from its CSS variable. */
function Swatch({ token }: { token: string }) {
  return (
    <li className="rounded-md border border-line p-2">
      <span
        className="block h-14 rounded-sm border border-line"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <span className="mt-2 block font-mono text-xs text-fg-muted">
        {token}
      </span>
    </li>
  );
}

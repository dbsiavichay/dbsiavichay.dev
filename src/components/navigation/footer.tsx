import { ArrowUp } from "lucide-react";

import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { profile } from "@/data/profile";
import { getI18n } from "@/i18n/server";
import { pageHref } from "@/lib/content";
import { SEPARATOR } from "@/lib/separator";

export async function Footer() {
  const { locale, dict } = await getI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-4 py-8 text-sm text-fg-subtle md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {profile.name}
        </p>
        <p>
          {dict.footer.builtWith}{" "}
          <TextLink href={pageHref(locale, "colophon")}>
            {dict.footer.colophon}
          </TextLink>
          {SEPARATOR}
          <TextLink href={profile.repository}>{dict.footer.source}</TextLink>
        </p>
        <a
          href="#main"
          className="inline-flex items-center gap-1.5 self-start rounded-sm transition-colors hover:text-fg md:self-auto"
        >
          {dict.footer.backToTop}
          <ArrowUp aria-hidden="true" className="size-3.5" />
        </a>
      </Container>
    </footer>
  );
}

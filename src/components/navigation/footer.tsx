import { ArrowUp } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Kbd } from "@/components/ui/kbd";
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
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {/* Opened by the ⌘K island, which listens for clicks on it. Touch
              screens have no use for it, so it isn't shown there. */}
          <button
            type="button"
            data-shortcuts-help
            aria-haspopup="dialog"
            className="group inline-flex items-center gap-2 rounded-sm transition-colors hover:text-fg [@media(hover:none)]:hidden"
          >
            <Kbd aria-hidden="true" className="group-active:keycap-pressed">
              ?
            </Kbd>
            {dict.footer.shortcuts}
          </button>
          <a
            href="#main"
            className="inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-fg"
          >
            {dict.footer.backToTop}
            <ArrowUp aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </Container>
    </footer>
  );
}

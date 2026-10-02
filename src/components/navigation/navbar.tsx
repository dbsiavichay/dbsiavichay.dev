import Link from "next/link";

import { Container } from "@/components/ui/container";
import { getI18n } from "@/i18n/server";

import { LocaleSwitch } from "./locale-switch";
import { MobileMenu } from "./mobile-menu";
import { getNavItems } from "./nav-items";

/** Sticky site header. Server-rendered; only the menu toggle and language switch hydrate. */
export async function Navbar() {
  const { locale, dict } = await getI18n();
  const items = getNavItems(locale, dict);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Link
          href={`/${locale}`}
          aria-label={dict.a11y.home}
          className="group flex items-center gap-3 rounded-sm"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-sm border border-line-strong font-mono text-xs font-medium text-fg transition-colors group-hover:border-accent"
          >
            DS
          </span>
          <span className="hidden font-medium tracking-tight text-fg sm:inline">
            {dict.meta.siteName}
          </span>
        </Link>

        <nav
          aria-label={dict.a11y.primaryNavigation}
          className="hidden md:block"
        >
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch current={locale} label={dict.a11y.languageSwitcher} />
          <MobileMenu
            items={items}
            navLabel={dict.a11y.primaryNavigation}
            openLabel={dict.a11y.openMenu}
            closeLabel={dict.a11y.closeMenu}
          />
        </div>
      </Container>
    </header>
  );
}

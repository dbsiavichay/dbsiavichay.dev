import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { SkipLink } from "@/components/navigation/skip-link";
import { GeistMono, GeistSans } from "@/fonts";
import { localeTags, locales } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    metadataBase: new URL(env.SITE_URL),
    title: { default: dict.meta.title, template: `%s — ${dict.meta.siteName}` },
    description: dict.meta.description,
    applicationName: dict.meta.siteName,
    authors: [{ name: "Denis Siavichay" }],
  };
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await getI18n();

  return (
    <html
      lang={localeTags[locale]}
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      <body className="flex min-h-dvh flex-col bg-canvas text-fg">
        <SkipLink label={dict.a11y.skipToContent} />
        <Navbar />
        {/* tabIndex lets the skip link move focus here in every browser. */}
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 flex-col outline-none"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

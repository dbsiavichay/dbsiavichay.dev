/**
 * Interface copy in English. This object defines the shape every other
 * dictionary must satisfy (see `es.ts`), so a missing or extra key is a type
 * error, not a blank label in production.
 *
 * Long-form content (case studies, notes) lives in MDX, not here.
 */
export const en = {
  meta: {
    siteName: "Denis Siavichay",
    title: "Denis Siavichay — Software Engineer",
    description:
      "Software engineer building the systems a business runs on — quoting, inventory, invoicing and production — from the domain model to the deploy pipeline.",
  },
  a11y: {
    skipToContent: "Skip to content",
    primaryNavigation: "Primary",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Denis Siavichay, home",
    languageSwitcher: "Language",
  },
  nav: {
    work: "Work",
    notes: "Notes",
    experience: "Experience",
    about: "About",
    contact: "Contact",
  },
  placeholder: {
    role: "Software Engineer",
    body: "This site is being rebuilt. Projects, case studies and engineering notes are on their way.",
  },
  notFound: {
    title: "This page doesn't exist.",
    body: "The link may be outdated or mistyped.",
    back: "Back to home",
  },
};

export type Dictionary = typeof en;

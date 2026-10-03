import type { StaticImageData } from "next/image";

import portrait from "@/assets/denis-siavichay.webp";
import type { Localized } from "@/i18n/localized";
import { pending, type Confirmable } from "@/lib/pending";

type Language = { name: Localized; level: Confirmable<Localized> };

type Photo = { image: StaticImageData; alt: Localized };

type Workspace = {
  keyboard: { model: string; layout: number; switches: string };
  /**
   * A photo of the real desk, encoded like the portrait (D34). Once there is
   * one, About shows it instead of the keyboard drawing.
   */
  photo?: Photo;
};

/** Denis's desk. Confirmed by Denis (2026-10-03); there is no photo yet. */
const workspace: Workspace = {
  keyboard: { model: "Keychron K2", layout: 0.75, switches: "Brown" },
};

/** Who Denis is and how to reach him. Sources: CV (2024), LinkedIn, Denis. */
export const profile = {
  name: "Denis Siavichay",
  jobTitle: "Software Engineer",
  email: "dbsiavichay@gmail.com",
  country: { en: "Ecuador", es: "Ecuador" } satisfies Localized,
  countryCode: "EC",
  timezone: "UTC−5",
  links: {
    github: "https://github.com/dbsiavichay",
    linkedin: "https://www.linkedin.com/in/dbsiavichay/",
  },
  /** This site's source. The repository is public. */
  repository: "https://github.com/dbsiavichay/dbsiavichay.dev",
  languages: [
    {
      name: { en: "Spanish", es: "Español" },
      level: { en: "native", es: "nativo" },
    },
    {
      name: { en: "English", es: "Inglés" },
      level: { en: "intermediate", es: "intermedio" },
    },
  ] satisfies Language[],
  /**
   * Cropped to 4:5 and encoded once, at twice the size it is shown, so the
   * server never resizes images at runtime (D34 in PORTFOLIO_PLAN.md). The
   * import gives its hashed URL and its dimensions.
   */
  photo: {
    image: portrait,
    alt: {
      en: "Denis Siavichay, in a navy blazer and a white shirt, smiling at the camera.",
      es: "Denis Siavichay, con saco azul marino y camisa blanca, sonríe a la cámara.",
    },
  } satisfies Photo,
  resume: pending("an updated CV in PDF to offer for download, or none"),
  workspace,
};

import type { Localized } from "@/i18n/localized";
import { pending, type Confirmable } from "@/lib/pending";

type Language = { name: Localized; level: Confirmable<Localized> };

/** Who Denis is and how to reach him. Sources: CV (2024), LinkedIn. */
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
      level: pending(
        "current English level (the 2024 CV says intermediate), or leave it out",
      ),
    },
  ] satisfies Language[],
  photo: pending("a photo for the About section, or none"),
  resume: pending("an updated CV in PDF to offer for download, or none"),
};

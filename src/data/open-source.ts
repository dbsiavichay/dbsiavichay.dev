import type { Localized } from "@/i18n/localized";

export type Package = {
  name: string;
  description: Localized;
  pypi: string;
  repository: string;
  /** Years of the first and the latest release on PyPI. */
  releases: { first: number; last: number };
};

/** Django packages published on PyPI. Source: PyPI release history. */
export const openSource: readonly Package[] = [
  {
    name: "django-superadmin",
    description: {
      en: "Speeds up building admin-like sites in Django: URLs, views and templates for each model.",
      es: "Acelera la construcción de sitios tipo admin en Django: URLs, vistas y templates para cada modelo.",
    },
    pypi: "https://pypi.org/project/django-superadmin/",
    repository: "https://github.com/dbsiavichay/django-superadmin",
    releases: { first: 2020, last: 2026 },
  },
  {
    name: "django-tracing",
    description: {
      en: "An audit trail of the changes made to Django models.",
      es: "Auditoría de los cambios hechos en los modelos de Django.",
    },
    pypi: "https://pypi.org/project/django-tracing/",
    repository: "https://github.com/dbsiavichay/django-tracing",
    releases: { first: 2020, last: 2021 },
  },
  {
    name: "django-successions",
    description: {
      en: "Alphanumeric sequences for Django models.",
      es: "Secuencias alfanuméricas para modelos de Django.",
    },
    pypi: "https://pypi.org/project/django-successions/",
    repository: "https://github.com/dbsiavichay/django-successions",
    releases: { first: 2021, last: 2022 },
  },
  {
    name: "django-crudpack",
    description: {
      en: "Helpers that simplify CRUD views in Django.",
      es: "Utilidades que simplifican las vistas CRUD en Django.",
    },
    pypi: "https://pypi.org/project/django-crudpack/",
    repository: "https://github.com/dbsiavichay/django-crudpack",
    releases: { first: 2024, last: 2024 },
  },
];

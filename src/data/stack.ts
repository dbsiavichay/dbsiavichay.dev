import type { Localized } from "@/i18n/localized";

import { job, project, thisSite, type Evidence } from "./evidence";

export type Technology = {
  name: string;
  /** Where it is in use, verified in each project's dependencies. */
  usedIn: Evidence[];
};

export type TechnologyGroup = {
  id: string;
  title: Localized;
  items: Technology[];
};

const maderable = project("maderable");
const faclab = project("faclab");
const salon = project("salon");
const sim = project("sim");
const konfio = job("konfio");
const justo = job("justo");

/** Grouped by role, no percentages. Each item names where it was used. */
export const stack: readonly TechnologyGroup[] = [
  {
    id: "languages",
    title: { en: "Languages", es: "Lenguajes" },
    items: [
      {
        name: "Python",
        usedIn: [maderable, faclab, salon, sim, konfio, justo],
      },
      {
        name: "TypeScript",
        usedIn: [maderable, faclab, salon, justo, thisSite],
      },
      { name: "Node.js", usedIn: [faclab, justo] },
      { name: "Rust", usedIn: [maderable] },
    ],
  },
  {
    id: "backend",
    title: { en: "Backend", es: "Backend" },
    items: [
      { name: "FastAPI", usedIn: [maderable, faclab, salon] },
      { name: "Django", usedIn: [sim, justo] },
      { name: "Flask", usedIn: [konfio] },
      { name: "Django REST Framework", usedIn: [sim] },
      { name: "SQLAlchemy · Alembic", usedIn: [maderable, faclab, salon] },
      { name: "Fastify", usedIn: [faclab] },
      { name: "Celery", usedIn: [sim] },
    ],
  },
  {
    id: "data",
    title: { en: "Data & messaging", es: "Datos y mensajería" },
    items: [
      { name: "PostgreSQL", usedIn: [maderable, faclab, salon, sim, konfio] },
      { name: "Redis", usedIn: [maderable, sim] },
      { name: "Kafka", usedIn: [faclab] },
      { name: "SNS · SQS", usedIn: [justo] },
      { name: "DynamoDB", usedIn: [faclab, justo] },
      { name: "S3", usedIn: [faclab] },
    ],
  },
  {
    id: "frontend",
    title: { en: "Frontend", es: "Frontend" },
    items: [
      { name: "React", usedIn: [maderable, faclab, salon, thisSite] },
      { name: "Next.js", usedIn: [thisSite] },
      { name: "TanStack Query", usedIn: [maderable, faclab, salon] },
      { name: "Vite", usedIn: [maderable, faclab, salon] },
      { name: "Tailwind CSS", usedIn: [faclab, thisSite] },
    ],
  },
  {
    id: "optimization",
    title: { en: "Optimization", es: "Optimización" },
    items: [
      { name: "OR-Tools CP-SAT", usedIn: [maderable] },
      { name: "PyO3", usedIn: [maderable] },
      { name: "NumPy", usedIn: [maderable] },
    ],
  },
  {
    id: "infrastructure",
    title: { en: "Infrastructure", es: "Infraestructura" },
    items: [
      { name: "Docker · Compose", usedIn: [maderable, faclab, salon, sim] },
      { name: "Caddy", usedIn: [maderable, salon] },
      { name: "GitHub Actions", usedIn: [maderable, salon] },
      { name: "GitLab CI", usedIn: [sim] },
      { name: "AWS", usedIn: [justo] },
    ],
  },
  {
    id: "observability",
    title: { en: "Observability", es: "Observabilidad" },
    items: [
      { name: "OpenTelemetry", usedIn: [faclab, justo] },
      { name: "SigNoz", usedIn: [justo] },
      { name: "structlog · pino", usedIn: [faclab] },
    ],
  },
  {
    id: "testing",
    title: { en: "Testing", es: "Testing" },
    items: [
      { name: "pytest", usedIn: [maderable, faclab, salon, sim] },
      { name: "Playwright", usedIn: [maderable, salon, thisSite] },
      { name: "Vitest", usedIn: [maderable, salon, thisSite] },
    ],
  },
];

import type { Localized } from "@/i18n/localized";
import { pending, type Confirmable, type Pending } from "@/lib/pending";

import { project, type Evidence } from "./evidence";

/** "2021" or "2021-10". Months are only given where a source states them. */
export type PartialDate = string;

export type DateRange = {
  start: Confirmable<PartialDate>;
  end: Confirmable<PartialDate> | "present";
};

export type ExperienceEntry = {
  /** Also the anchor of the entry: `#experience-<id>`. */
  id: string;
  organization: Confirmable<Localized>;
  /** Sector and place, in a few words. */
  context?: Localized;
  role: Confirmable<Localized>;
  period: DateRange;
  /** The problem the work answered. */
  problem?: Localized;
  /** What was done and, only where it is documented, what came of it. */
  highlights: Localized<readonly string[]>;
  stack: readonly string[];
  evidence: readonly Evidence[];
  unconfirmed?: readonly Pending[];
};

/**
 * Work history, newest first. Sources: CV (June 2024), LinkedIn export and
 * git history. Results only appear where a source documents them.
 */
export const experience = [
  {
    id: "current",
    organization: pending(
      "current employer: company, or a description of the sector if it is confidential",
    ),
    role: pending("current role"),
    period: { start: pending("start date of the current job"), end: "present" },
    highlights: { en: [], es: [] },
    stack: [],
    evidence: [],
  },
  {
    id: "independent",
    organization: { en: "Independent", es: "Independiente" },
    context: {
      en: "Client projects and my own product",
      es: "Proyectos para clientes y producto propio",
    },
    role: { en: "Software Engineer", es: "Software Engineer" },
    period: { start: "2025", end: "present" },
    problem: {
      en: "Each client needed its operation turned into software: quoting and production for a board shop, appointments and cash for a beauty salon.",
      es: "Cada cliente necesitaba llevar su operación a software: cotización y producción en un taller de tableros, agenda y caja en un salón de belleza.",
    },
    highlights: {
      en: [
        "Design, build and operate each system end to end, from the domain model to the server it runs on.",
        "In parallel, Faclab: my own sales and electronic-invoicing product.",
      ],
      es: [
        "Diseño, construyo y opero cada sistema de punta a punta, desde el modelo de dominio hasta el servidor donde corre.",
        "En paralelo, Faclab: mi producto propio de ventas y facturación electrónica.",
      ],
    },
    stack: ["Python", "FastAPI", "PostgreSQL", "React", "TypeScript", "Rust"],
    evidence: [project("maderable"), project("salon"), project("faclab")],
  },
  {
    id: "justo",
    organization: { en: "Jüsto", es: "Jüsto" },
    context: {
      en: "E-commerce · Mexico, remote",
      es: "E-commerce · México, remoto",
    },
    role: { en: "Software Engineer", es: "Software Engineer" },
    period: {
      start: "2021-10",
      end: pending("the month Denis left Jüsto"),
    },
    problem: {
      en: "An e-commerce platform moving from a Django system to microservices.",
      es: "Una plataforma de e-commerce que pasaba de un sistema Django a microservicios.",
    },
    highlights: {
      en: [
        "Built features aimed at the site's conversion.",
        "Integrated external services to run promotional campaigns.",
        "Took part in the migration to microservices in Python and, mostly, Node.js on AWS, with metrics and monitoring.",
      ],
      es: [
        "Desarrollé funcionalidades orientadas a la conversión del sitio.",
        "Integré servicios externos para ejecutar campañas promocionales.",
        "Participé en la migración a microservicios en Python y, sobre todo, Node.js sobre AWS, con métricas y monitoreo.",
      ],
    },
    stack: ["Python", "Django", "Node.js", "AWS"],
    evidence: [],
    unconfirmed: [
      pending(
        "measurable results at Jüsto (the 2024 CV mentions more engagement and sales, without figures)",
      ),
    ],
  },
  {
    id: "morona-developer",
    organization: {
      en: "Municipality of Morona",
      es: "Municipio del cantón Morona",
    },
    context: {
      en: "Public sector · Macas, Ecuador",
      es: "Sector público · Macas, Ecuador",
    },
    role: {
      en: "Software Developer · team lead",
      es: "Software Developer · líder de equipo",
    },
    period: { start: "2019-09", end: "2021-09" },
    problem: {
      en: "The institution ran on manual processes and a few isolated systems.",
      es: "La institución funcionaba con procesos manuales y algunos sistemas aislados.",
    },
    highlights: {
      en: [
        "Led a team of three building SIM, the integrated system that brought those processes together.",
        "The system centralized the institution's data and automated repetitive tasks.",
      ],
      es: [
        "Lideré un equipo de tres que construyó el SIM, el sistema integrado que reunió esos procesos.",
        "El sistema centralizó los datos de la institución y automatizó tareas repetitivas.",
      ],
    },
    stack: ["Django", "Django REST Framework", "PostgreSQL", "Celery"],
    evidence: [project("sim")],
  },
  {
    id: "morona-analyst",
    organization: {
      en: "Municipality of Morona",
      es: "Municipio del cantón Morona",
    },
    context: {
      en: "Public sector · Macas, Ecuador",
      es: "Sector público · Macas, Ecuador",
    },
    role: { en: "Systems Analyst", es: "Analista de sistemas" },
    period: { start: "2015-09", end: "2019-08" },
    problem: {
      en: "The institution needed to control and track its IT equipment and the city's pets.",
      es: "La institución necesitaba controlar y dar seguimiento a sus equipos informáticos y a las mascotas de la ciudad.",
    },
    highlights: {
      en: [
        "An IT equipment system: registration, status, location and the employee each item is assigned to.",
        "A city pet registry to support the enforcement of local regulations.",
        "Both were web applications served from the institution's local network.",
      ],
      es: [
        "Un sistema de equipos informáticos: registro, estado, ubicación y la persona a la que está asignado cada equipo.",
        "Un registro de mascotas de la ciudad para apoyar el cumplimiento de las normativas.",
        "Ambos fueron aplicaciones web servidas desde la red local de la institución.",
      ],
    },
    stack: ["Python", "Django", "PostgreSQL"],
    evidence: [],
  },
  {
    id: "freelance",
    organization: { en: "Independent", es: "Independiente" },
    context: {
      en: "A local business · Macas, Ecuador",
      es: "Un negocio local · Macas, Ecuador",
    },
    role: { en: "Freelance developer", es: "Freelance" },
    period: { start: "2013-03", end: "2015-08" },
    problem: {
      en: "Sales agents needed to record orders during their visits to small stores.",
      es: "Los agentes de ventas necesitaban registrar pedidos durante sus visitas a las tiendas.",
    },
    highlights: {
      en: [
        "Built a responsive web application to record orders in real time.",
        "Shaped it with the sales team around how they worked.",
      ],
      es: [
        "Construí una aplicación web responsive para registrar los pedidos en tiempo real.",
        "La ajusté con el equipo de ventas según su forma de trabajar.",
      ],
    },
    stack: ["Java", "PostgreSQL"],
    evidence: [],
  },
] as const satisfies readonly ExperienceEntry[];

export type ExperienceId = (typeof experience)[number]["id"];

export type EducationEntry = {
  id: string;
  degree: Localized;
  institution: Localized;
  period: DateRange;
};

/** Sources: CV (2024) and LinkedIn, which disagree on the ESPOCH dates. */
export const education: readonly EducationEntry[] = [
  {
    id: "unir",
    degree: {
      en: "Master's in Software Engineering and Computer Systems",
      es: "Máster en Ingeniería de Software y Sistemas Informáticos",
    },
    institution: {
      en: "Universidad Internacional de La Rioja (UNIR), Spain",
      es: "Universidad Internacional de La Rioja (UNIR), España",
    },
    period: { start: "2018", end: "2019" },
  },
  {
    id: "espoch",
    degree: { en: "Systems Engineering", es: "Ingeniería en Sistemas" },
    institution: {
      en: "Escuela Superior Politécnica de Chimborazo (ESPOCH), Ecuador",
      es: "Escuela Superior Politécnica de Chimborazo (ESPOCH), Ecuador",
    },
    period: {
      start: "2008",
      end: pending("ESPOCH graduation year (the sources say 2013 and 2015)"),
    },
  },
];

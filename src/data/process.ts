import type { Localized } from "@/i18n/localized";

import { project, type Evidence } from "./evidence";

export type ProcessStep = {
  id: string;
  title: Localized;
  principle: Localized;
  /** A real case where the step made a difference. */
  example: Localized;
  evidence: Evidence;
};

/** How Denis works, one real example per step. */
export const processSteps: readonly ProcessStep[] = [
  {
    id: "understand",
    title: { en: "Understand", es: "Entender" },
    principle: {
      en: "Find the objective the business actually has before writing code.",
      es: "Encontrar el objetivo real del negocio antes de escribir código.",
    },
    example: {
      en: "The board shop didn't need pieces arranged on a board; it needed the cheapest quote. Half boards are what it sells, so the half board became the bin.",
      es: "El taller no necesitaba piezas acomodadas en un tablero, sino la cotización más barata. Vende medios tableros, así que el medio tablero pasó a ser el bin.",
    },
    evidence: project("maderable"),
  },
  {
    id: "model",
    title: { en: "Model", es: "Modelar" },
    principle: {
      en: "Put the rules in the model, at the level where nothing can bypass them.",
      es: "Llevar las reglas al modelo, al nivel donde nada pueda saltárselas.",
    },
    example: {
      en: "In the salon app, a PostgreSQL GiST exclusion constraint makes double booking impossible, and each appointment freezes its price.",
      es: "En la app del salón, un constraint de exclusión GiST en PostgreSQL hace imposible el doble agendamiento, y cada cita congela su precio.",
    },
    evidence: project("salon"),
  },
  {
    id: "design",
    title: { en: "Design", es: "Diseñar" },
    principle: {
      en: "Choose the architecture for the problem in front of you, not for fashion.",
      es: "Elegir la arquitectura según el problema que hay delante, no por moda.",
    },
    example: {
      en: "In Faclab, the sale event started carrying all the data the invoice needs, which removed an HTTP callback between services.",
      es: "En Faclab, el evento de venta pasó a llevar todos los datos que necesita la factura, y eso eliminó un callback HTTP entre servicios.",
    },
    evidence: project("faclab"),
  },
  {
    id: "build",
    title: { en: "Build", es: "Construir" },
    principle: {
      en: "Make the hard parts verifiable.",
      es: "Hacer verificables las partes difíciles.",
    },
    example: {
      en: "Maderable's Rust kernel must return exactly what the Python reference implementation returns, so the reference stays as the oracle.",
      es: "El kernel en Rust de Maderable debe devolver exactamente lo mismo que la implementación de referencia en Python, que se queda como oráculo.",
    },
    evidence: project("maderable"),
  },
  {
    id: "observe",
    title: { en: "Observe", es: "Observar" },
    principle: {
      en: "Make production legible before something goes wrong.",
      es: "Hacer legible la producción antes de que algo falle.",
    },
    example: {
      en: "Faclab's services emit OpenTelemetry spans per handler and carry the trace context in Kafka headers.",
      es: "Los servicios de Faclab emiten spans de OpenTelemetry por handler y propagan el contexto de traza en los headers de Kafka.",
    },
    evidence: project("faclab"),
  },
  {
    id: "improve",
    title: { en: "Improve", es: "Mejorar" },
    principle: {
      en: "Remove what doesn't pay for itself, including my own work.",
      es: "Quitar lo que no se justifica, incluido mi propio trabajo.",
    },
    example: {
      en: "The salon app had multi-tenancy and a staff roster. Both were removed once the business turned out to be one salon, run by its owner alone.",
      es: "La app del salón tenía multi-tenancy y un roster de profesionales. Ambos se retiraron cuando el negocio resultó ser un solo salón, sin más profesionales que la persona propietaria.",
    },
    evidence: project("salon"),
  },
];

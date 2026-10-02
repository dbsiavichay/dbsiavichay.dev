import type { Localized } from "@/i18n/localized";

import { job, project, type Evidence } from "./evidence";

export type Capability = {
  id: string;
  title: Localized;
  body: Localized;
  evidence: Evidence[];
};

/** The four kinds of problem Denis works on. Every one points to its proof. */
export const capabilities: readonly Capability[] = [
  {
    id: "business-platforms",
    title: { en: "Business platforms", es: "Plataformas de negocio" },
    body: {
      en: "The systems a business runs on every day: quotes, orders, inventory, appointments, cash. Modeled on how the work really happens, with the rules enforced where they can't be skipped.",
      es: "Los sistemas con los que un negocio opera cada día: cotizaciones, órdenes, inventario, citas, caja. Modelados según cómo ocurre el trabajo de verdad, con las reglas aplicadas donde no se pueden saltar.",
    },
    evidence: [project("maderable"), project("salon"), project("sim")],
  },
  {
    id: "integrations",
    title: { en: "Integrations", es: "Integraciones" },
    body: {
      en: "Connecting to what already exists: electronic invoicing with Ecuador's tax authority, an inventory system that can only be read, printers on a shop floor, external services for campaigns.",
      es: "Conectar con lo que ya existe: facturación electrónica con el SRI, un sistema de inventario que solo se puede leer, impresoras en un taller, servicios externos para campañas.",
    },
    evidence: [project("faclab"), project("maderable"), job("justo")],
  },
  {
    id: "distributed-systems",
    title: { en: "Distributed systems", es: "Sistemas distribuidos" },
    body: {
      en: "Services that talk through events, with traces that follow a request across the queue, and the judgment to merge a service back when the split costs more than it gives.",
      es: "Servicios que se comunican por eventos, con trazas que siguen una petición a través de la cola, y el criterio para volver a unir un servicio cuando separarlo cuesta más de lo que aporta.",
    },
    evidence: [project("faclab"), job("justo")],
  },
  {
    id: "optimization",
    title: { en: "Optimization", es: "Optimización" },
    body: {
      en: "Turning a business objective into a search problem: two-dimensional guillotine cutting that minimizes the material a customer pays for, deterministic and reproducible.",
      es: "Convertir un objetivo de negocio en un problema de búsqueda: corte en guillotina en dos dimensiones que minimiza el material que paga el cliente, determinista y reproducible.",
    },
    evidence: [project("maderable")],
  },
];

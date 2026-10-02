import type { Localized } from "@/i18n/localized";

/**
 * The life of a Maderable job, from the seller's quote to dispatch. Source:
 * the quote and order state machines in the API (`draft → sent → confirmed`,
 * then `confirmed → queued → in_process → finished → dispatched`). The
 * existing inventory system sits beside the flow and is only ever read.
 */

export type Activity = {
  id: "cutting" | "banding" | "additional";
  name: Localized;
  actor: Localized;
  /** When the activity exists on an order, and what holds it back. */
  rule: Localized;
};

export type Stage = {
  id: string;
  /** The state's value in the API. */
  state: string;
  name: Localized;
  actor: Localized;
  summary: Localized;
  rule: Localized;
  /** How the stage relates to the read-only inventory, if it does. */
  inventory?: Localized;
  activities?: Activity[];
};

export const stages: Stage[] = [
  {
    id: "quote",
    state: "draft",
    name: { en: "Quote", es: "Cotización" },
    actor: { en: "Seller", es: "Vendedor" },
    summary: {
      en: "The seller turns the customer's cut list into a quote. While it's open, it re-optimizes on every read, so prices and layout follow the current catalog.",
      es: "El vendedor convierte el despiece del cliente en una cotización. Mientras está abierta, se re-optimiza en cada lectura, así que precios y plano siguen al catálogo vigente.",
    },
    rule: {
      en: "A piece that can't be placed blocks saving, sending and confirming: the web app stops it first, and the API refuses it anyway.",
      es: "Una pieza que no se puede ubicar impide guardar, enviar y confirmar: la web lo frena primero, y la API lo rechaza de todos modos.",
    },
    inventory: {
      en: "The catalog and the clients sync from the existing inventory. Nothing is ever written back.",
      es: "El catálogo y los clientes se sincronizan desde el inventario existente. Nunca se escribe nada de vuelta.",
    },
  },
  {
    id: "review",
    state: "sent",
    name: { en: "Review", es: "Revisión" },
    actor: { en: "Customer", es: "Cliente" },
    summary: {
      en: "The customer opens the quote on a link, without an account, and confirms it, rejects it or asks for changes. Changes send it back to the seller.",
      es: "El cliente abre la cotización en un enlace, sin cuenta, y la confirma, la rechaza o pide cambios. Los cambios la devuelven al vendedor.",
    },
    rule: {
      en: "The link is a random token, and only its hash is stored.",
      es: "El enlace es un token aleatorio, y solo se guarda su hash.",
    },
  },
  {
    id: "order",
    state: "confirmed",
    name: { en: "Order", es: "Orden" },
    actor: { en: "Customer, by confirming", es: "Cliente, al confirmar" },
    summary: {
      en: "Confirming the quote creates the order: an immutable snapshot of the cutting plan and its prices.",
      es: "Confirmar la cotización crea la orden: un snapshot inmutable del plano de corte y sus precios.",
    },
    rule: {
      en: "The order never re-optimizes: what the customer confirmed is what gets cut.",
      es: "La orden nunca se re-optimiza: lo que el cliente confirmó es lo que se corta.",
    },
  },
  {
    id: "queue",
    state: "queued",
    name: { en: "Queue", es: "Cola" },
    actor: { en: "Seller or administrator", es: "Vendedor o administrador" },
    summary: {
      en: "The order joins the workshop queue. This is the moment the sale is charged.",
      es: "La orden entra a la cola del taller. Es el momento en que se cobra la venta.",
    },
    rule: {
      en: "Entering the queue takes the payment method and the invoice number. A paid order can only be cancelled by an administrator, with a written reason.",
      es: "Entrar a la cola exige la forma de pago y el número de factura. Una orden pagada solo la puede cancelar un administrador, con un motivo escrito.",
    },
  },
  {
    id: "workshop",
    state: "in_process",
    name: { en: "Workshop", es: "Taller" },
    actor: { en: "Operator and edge bander", es: "Operador y canteador" },
    summary: {
      en: "Three activities run in parallel, each with its own status, person and clock. Each piece's label prints as it's cut, through the agent on the shop's PC.",
      es: "Tres actividades corren en paralelo, cada una con su propio estado, responsable y reloj. La etiqueta de cada pieza se imprime al cortarla, a través del agente del PC del local.",
    },
    rule: {
      en: "The order's status is derived from its activities: starting the cut takes it out of the queue.",
      es: "El estado de la orden se deriva de sus actividades: empezar el corte la saca de la cola.",
    },
    activities: [
      {
        id: "cutting",
        name: { en: "Cutting", es: "Corte" },
        actor: { en: "Operator", es: "Operador" },
        rule: {
          en: "On every order.",
          es: "En todas las órdenes.",
        },
      },
      {
        id: "banding",
        name: { en: "Edge banding", es: "Canteado" },
        actor: { en: "Edge bander", es: "Canteador" },
        rule: {
          en: "Only if the order bills edge banding. It can't start until a piece that needs banding has been cut, nor finish until all of them have.",
          es: "Solo si la orden cobra tapacanto. No puede empezar hasta que se corte una pieza que lo lleve, ni terminar hasta que se hayan cortado todas.",
        },
      },
      {
        id: "additional",
        name: { en: "Additional work", es: "Trabajos adicionales" },
        actor: { en: "Edge bander", es: "Canteador" },
        rule: {
          en: "Only if a piece carries a workshop code.",
          es: "Solo si alguna pieza lleva un código de taller.",
        },
      },
    ],
  },
  {
    id: "finished",
    state: "finished",
    name: { en: "Finished", es: "Terminada" },
    actor: { en: "Nobody: it's derived", es: "Nadie: se deriva" },
    summary: {
      en: "Closing the last activity that applies finishes the order by itself.",
      es: "Cerrar la última actividad que aplica termina la orden por sí sola.",
    },
    rule: {
      en: "Finishing by hand is possible, and gated the same way: every activity has to be done.",
      es: "Terminarla a mano es posible, con la misma compuerta: todas las actividades tienen que estar hechas.",
    },
  },
  {
    id: "dispatch",
    state: "dispatched",
    name: { en: "Dispatch", es: "Despacho" },
    actor: { en: "Seller or administrator", es: "Vendedor o administrador" },
    summary: {
      en: "The goods reach the customer. The order is closed for good.",
      es: "La mercadería llega al cliente. La orden queda cerrada definitivamente.",
    },
    rule: {
      en: "Dispatch is a commercial act: the shop floor can't do it.",
      es: "Despachar es un acto comercial: el taller no puede hacerlo.",
    },
  },
];

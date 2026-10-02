import type { Localized } from "@/i18n/localized";
import type {
  Box,
  DiagramFigure,
  DiagramNode,
  DiagramEdge,
} from "@/lib/diagram";

/**
 * The two architecture diagrams that earn an interactive canvas. Sources:
 * Maderable's architecture and deployment docs; the git history of Faclab's
 * core and invoicing service, which dates the two shapes of its pipeline.
 * Coordinates are in diagram units; text must fit on one line of its box.
 */

type Node = DiagramNode<Localized>;
type Edge = DiagramEdge<Localized>;

/** How far down a box's side a point at height `y` is (0–1). */
const along = (box: Box, y: number) => (y - box.y) / box.h;

// --- Maderable ---------------------------------------------------------

const caddy: Node = {
  id: "caddy",
  kind: "service",
  x: 200,
  y: 40,
  w: 104,
  h: 316,
  label: { en: "Caddy", es: "Caddy" },
  sublabel: { en: "one origin", es: "un origen" },
  detail: {
    en: "Terminates TLS and serves the web app and the API from the same origin: no CORS, and the frontend image works in any environment.",
    es: "Termina TLS y sirve la web y la API desde el mismo origen: sin CORS, y la imagen del frontend funciona en cualquier entorno.",
  },
};

const maderableNodes: Node[] = [
  {
    id: "seller",
    kind: "actor",
    x: 0,
    y: 40,
    w: 132,
    h: 64,
    label: { en: "Seller", es: "Vendedor" },
    sublabel: { en: "browser", es: "navegador" },
    detail: {
      en: "Quotes with the customer in front of them, and can rearrange a plan by hand. The server decides whether each change is valid.",
      es: "Cotiza con el cliente enfrente y puede reorganizar un plano a mano. El servidor decide si cada cambio es válido.",
    },
  },
  {
    id: "customer",
    kind: "actor",
    x: 0,
    y: 172,
    w: 132,
    h: 64,
    label: { en: "Customer", es: "Cliente" },
    sublabel: { en: "review link", es: "por enlace" },
    detail: {
      en: "Opens the quote on a link, without an account, to confirm it, reject it or ask for changes. Only the token's hash is stored.",
      es: "Abre la cotización en un enlace, sin cuenta, para confirmarla, rechazarla o pedir cambios. Solo se guarda el hash del token.",
    },
  },
  {
    id: "agent",
    kind: "service",
    x: 0,
    y: 300,
    w: 132,
    h: 64,
    label: { en: "Print agent", es: "Agente" },
    sublabel: { en: "the shop's PC", es: "PC del local" },
    detail: {
      en: "A thin Windows agent at the shop. It keeps an outbound long-poll to the API, prints what the backend rendered and acknowledges it. At-least-once: a duplicate label is acceptable, a lost one isn't.",
      es: "Un agente liviano en Windows, en el local. Mantiene un long-poll saliente hacia la API, imprime lo que el backend generó y lo confirma. Al menos una vez: una etiqueta duplicada es aceptable, una perdida no.",
    },
  },
  {
    id: "printers",
    kind: "external",
    x: 0,
    y: 404,
    w: 132,
    h: 56,
    label: { en: "Printers", es: "Impresoras" },
    sublabel: { en: "piece labels", es: "etiquetas" },
    detail: {
      en: "The shop's printers. The agent sends them what the backend rendered; the shop's network opens nothing to the outside.",
      es: "Las impresoras del local. El agente les envía lo que el backend generó; la red del local no abre nada hacia afuera.",
    },
  },
  caddy,
  {
    id: "web",
    kind: "service",
    x: 334,
    y: 40,
    w: 152,
    h: 64,
    label: { en: "Web app", es: "Web" },
    sublabel: { en: "React · TypeScript", es: "React · TypeScript" },
    detail: {
      en: "The seller's and the workshop's interface. It blocks a quote with a piece that can't be placed, before the API refuses it anyway.",
      es: "La interfaz del vendedor y del taller. Bloquea una cotización con una pieza que no se puede ubicar, antes de que la API la rechace de todos modos.",
    },
  },
  {
    id: "api",
    kind: "service",
    x: 334,
    y: 172,
    w: 152,
    h: 64,
    label: { en: "API", es: "API" },
    sublabel: { en: "FastAPI · slices", es: "FastAPI · slices" },
    detail: {
      en: "FastAPI organized in vertical slices: each resource owns its router, service, schemas and model, with a generic CRUD base and a single error pipeline.",
      es: "FastAPI organizado en vertical slices: cada recurso tiene su router, servicio, schemas y modelo, con una base CRUD genérica y un único pipeline de errores.",
    },
  },
  {
    id: "engine",
    kind: "service",
    x: 516,
    y: 40,
    w: 140,
    h: 64,
    label: { en: "Cutting engine", es: "Motor de corte" },
    sublabel: { en: "Rust · CP-SAT", es: "Rust · CP-SAT" },
    detail: {
      en: "A package with no framework imports: geometry and prices in, cutting layouts out. A Python reference, a Rust kernel that returns exactly the same result, and CP-SAT for exact endgames.",
      es: "Un paquete sin imports de framework: entra geometría y precios, salen planos de corte. Una referencia en Python, un kernel en Rust que devuelve exactamente el mismo resultado, y CP-SAT para los cierres exactos.",
    },
  },
  {
    id: "postgres",
    kind: "store",
    x: 334,
    y: 300,
    w: 152,
    h: 64,
    label: { en: "PostgreSQL", es: "PostgreSQL" },
    sublabel: { en: "system of record", es: "sistema de registro" },
    detail: {
      en: "Quotes, orders frozen as immutable snapshots, the workshop's activities and the print queue.",
      es: "Cotizaciones, órdenes congeladas como snapshots inmutables, las actividades del taller y la cola de impresión.",
    },
  },
  {
    id: "redis",
    kind: "store",
    x: 516,
    y: 300,
    w: 140,
    h: 64,
    label: { en: "Redis", es: "Redis" },
    sublabel: { en: "cached plans", es: "planos en caché" },
    detail: {
      en: "Optimization results, keyed by a hash of the request and the engine version, so a stale plan is never served.",
      es: "Resultados de optimización, indexados por un hash del request y la versión del motor, para nunca servir un plano obsoleto.",
    },
  },
  {
    id: "inventory",
    kind: "external",
    x: 708,
    y: 172,
    w: 140,
    h: 64,
    label: { en: "Inventory", es: "Inventario" },
    sublabel: { en: "existing system", es: "sistema existente" },
    detail: {
      en: "The shop's existing inventory system. The catalog and the clients sync from it; nothing is ever written back.",
      es: "El sistema de inventario que el local ya usaba. El catálogo y los clientes se sincronizan desde ahí; nunca se escribe nada de vuelta.",
    },
  },
];

const maderableEdges: Edge[] = [
  {
    id: "seller-caddy",
    from: { node: "seller", side: "right" },
    to: { node: "caddy", side: "left", at: along(caddy, 72) },
    kind: "request",
    label: { en: "HTTPS", es: "HTTPS" },
  },
  {
    id: "customer-caddy",
    from: { node: "customer", side: "right" },
    to: { node: "caddy", side: "left", at: along(caddy, 204) },
    kind: "request",
  },
  {
    id: "agent-caddy",
    from: { node: "agent", side: "right" },
    to: { node: "caddy", side: "left", at: along(caddy, 332) },
    kind: "request",
    label: { en: "long-poll", es: "long-poll" },
  },
  {
    id: "agent-printers",
    from: { node: "agent", side: "bottom" },
    to: { node: "printers", side: "top" },
    kind: "request",
  },
  {
    id: "caddy-web",
    from: { node: "caddy", side: "right", at: along(caddy, 72) },
    to: { node: "web", side: "left" },
    kind: "request",
  },
  {
    id: "caddy-api",
    from: { node: "caddy", side: "right", at: along(caddy, 204) },
    to: { node: "api", side: "left" },
    kind: "request",
    label: { en: "/api", es: "/api" },
  },
  {
    id: "api-engine",
    from: { node: "api", side: "top", at: 0.8 },
    to: { node: "engine", side: "bottom" },
    kind: "request",
    label: { en: "in-process", es: "en proceso" },
  },
  {
    id: "api-postgres",
    from: { node: "api", side: "bottom" },
    to: { node: "postgres", side: "top" },
    kind: "request",
  },
  {
    id: "api-redis",
    from: { node: "api", side: "bottom", at: 0.8 },
    to: { node: "redis", side: "top" },
    kind: "request",
    label: { en: "cache", es: "caché" },
  },
  {
    id: "api-inventory",
    from: { node: "api", side: "right" },
    to: { node: "inventory", side: "left" },
    kind: "read",
    label: { en: "read-only sync", es: "sync de solo lectura" },
  },
];

export const maderableArchitecture: DiagramFigure<Localized> = {
  id: "maderable",
  title: {
    en: "Maderable · runtime architecture",
    es: "Maderable · arquitectura en ejecución",
  },
  caption: {
    en: "Everything inside the dashed box runs on one VPS with Docker Compose. The existing inventory is only ever read.",
    es: "Todo lo que está dentro del recuadro punteado corre en un VPS con Docker Compose. El inventario existente solo se lee.",
  },
  variants: [
    {
      id: "runtime",
      name: { en: "Runtime", es: "Ejecución" },
      width: 848,
      height: 480,
      groups: [
        {
          id: "vps",
          label: { en: "VPS · Docker Compose", es: "VPS · Docker Compose" },
          x: 164,
          y: 8,
          w: 512,
          h: 464,
        },
      ],
      nodes: maderableNodes,
      edges: maderableEdges,
    },
  ],
};

// --- Faclab ------------------------------------------------------------

const sri: Node = {
  id: "sri",
  kind: "external",
  x: 620,
  y: 150,
  w: 168,
  h: 64,
  label: { en: "SRI", es: "SRI" },
  sublabel: { en: "tax authority · SOAP", es: "autoridad · SOAP" },
  detail: {
    en: "Ecuador's tax authority. Its SOAP services validate the signed invoice and then authorize it; only then is the invoice valid.",
    es: "La autoridad tributaria de Ecuador. Sus servicios SOAP validan la factura firmada y luego la autorizan; recién entonces la factura es válida.",
  },
};

const invoicingBox = { x: 400, y: 150, w: 180, h: 64 };

const toTopic: Edge = {
  id: "core-topic",
  from: { node: "core", side: "right" },
  to: { node: "topic", side: "left" },
  kind: "event",
};

const fromTopic: Edge = {
  id: "topic-invoicing",
  from: { node: "topic", side: "right" },
  to: { node: "invoicing", side: "left" },
  kind: "event",
};

const toSri: Edge = {
  id: "invoicing-sri",
  from: { node: "invoicing", side: "right" },
  to: { node: "sri", side: "left" },
  kind: "request",
};

export const faclabInvoicing: DiagramFigure<Localized> = {
  id: "faclab",
  title: {
    en: "Faclab · the invoicing pipeline, twice",
    es: "Faclab · el pipeline de facturación, dos veces",
  },
  caption: {
    en: "Same job, two shapes. In 2026 the event carries the sale, the callback is gone and signing moved back inside invoicing.",
    es: "El mismo trabajo, dos formas. En 2026 el evento lleva la venta, el callback desaparece y la firma vuelve a la facturación.",
  },
  variants: [
    {
      id: "2025",
      name: {
        en: "2025 · notification + callback",
        es: "2025 · aviso + callback",
      },
      width: 788,
      height: 370,
      groups: [],
      nodes: [
        {
          id: "core",
          kind: "service",
          x: 0,
          y: 150,
          w: 150,
          h: 64,
          label: { en: "Core", es: "Core" },
          sublabel: { en: "Django", es: "Django" },
          detail: {
            en: "The Django monolith, system of record. When a sale was invoiced, it published a message with the sale's id.",
            es: "El monolito Django, sistema de registro. Cuando se facturaba una venta, publicaba un mensaje con el id de la venta.",
          },
        },
        {
          id: "topic",
          kind: "topic",
          x: 190,
          y: 158,
          w: 170,
          h: 48,
          label: { en: "invoice created", es: "factura creada" },
          sublabel: { en: "the sale's id only", es: "solo el id" },
          detail: {
            en: "A notification: it says which sale, not what's in it.",
            es: "Un aviso: dice qué venta, no qué contiene.",
          },
        },
        {
          id: "invoicing",
          kind: "service",
          ...invoicingBox,
          label: { en: "Invoicing", es: "Facturación" },
          sublabel: { en: "TypeScript", es: "TypeScript" },
          detail: {
            en: "Consumed the message, called the core back for the data, asked the signing service for a seal and talked to the SRI.",
            es: "Consumía el mensaje, llamaba al core para pedir los datos, pedía el sello al servicio de firma y hablaba con el SRI.",
          },
        },
        {
          id: "signing",
          kind: "service",
          x: 400,
          y: 290,
          w: 180,
          h: 64,
          label: { en: "Signing service", es: "Servicio de firma" },
          sublabel: { en: "own certificate store", es: "certificados propios" },
          detail: {
            en: "Kept the certificates encrypted and sealed documents on request. Another deployable and another datastore, used by nothing but invoicing.",
            es: "Guardaba los certificados cifrados y sellaba documentos a pedido. Otro deployable y otro datastore, que solo usaba la facturación.",
          },
        },
        sri,
      ],
      edges: [
        toTopic,
        fromTopic,
        {
          id: "invoicing-core",
          from: { node: "invoicing", side: "top" },
          to: { node: "core", side: "top" },
          kind: "request",
          label: {
            en: "HTTP callback for the data",
            es: "callback HTTP por los datos",
          },
        },
        {
          id: "invoicing-signing",
          from: { node: "invoicing", side: "bottom" },
          to: { node: "signing", side: "top" },
          kind: "request",
          label: { en: "seal", es: "sellar" },
        },
        toSri,
      ],
    },
    {
      id: "2026",
      name: {
        en: "2026 · event-carried state",
        es: "2026 · estado en el evento",
      },
      width: 788,
      height: 370,
      groups: [],
      nodes: [
        {
          id: "core",
          kind: "service",
          x: 0,
          y: 150,
          w: 150,
          h: 64,
          label: { en: "Core", es: "Core" },
          sublabel: { en: "FastAPI · CQRS", es: "FastAPI · CQRS" },
          detail: {
            en: "FastAPI, Clean Architecture and CQRS. A confirmed sale publishes the customer and every line, with the trace context in the message headers.",
            es: "FastAPI, Clean Architecture y CQRS. Una venta confirmada publica el cliente y cada línea, con el contexto de traza en los headers del mensaje.",
          },
        },
        {
          id: "topic",
          kind: "topic",
          x: 190,
          y: 158,
          w: 170,
          h: 48,
          label: { en: "sales.confirmed", es: "sales.confirmed" },
          sublabel: { en: "the whole sale", es: "la venta completa" },
          detail: {
            en: "Event-carried state: the consumer needs nothing else. The schema is now an API, validated with Zod at the boundary.",
            es: "Estado en el evento: el consumidor no necesita nada más. El schema ahora es una API, validada con Zod en el borde.",
          },
        },
        {
          id: "invoicing",
          kind: "service",
          ...invoicingBox,
          label: { en: "Invoicing", es: "Facturación" },
          sublabel: { en: "signs XML locally", es: "firma el XML" },
          detail: {
            en: "TypeScript and Fastify. Signs the XML itself (XAdES-BES), and runs each state transition as an isolated command.",
            es: "TypeScript y Fastify. Firma el XML por su cuenta (XAdES-BES) y ejecuta cada transición de estado como un comando aislado.",
          },
        },
        {
          id: "invoices",
          kind: "topic",
          x: 400,
          y: 20,
          w: 180,
          h: 48,
          label: { en: "invoices", es: "invoices" },
          sublabel: {
            en: "one message per state",
            es: "un mensaje por estado",
          },
          detail: {
            en: "The service publishes each new state and consumes it to trigger the next step — created, signed, sent, authorized — so each step fails, retries and is observed on its own.",
            es: "El servicio publica cada estado nuevo y lo consume para disparar el siguiente paso —creada, firmada, enviada, autorizada—, así cada paso falla, se reintenta y se observa por separado.",
          },
        },
        {
          id: "dynamodb",
          kind: "store",
          x: 251,
          y: 300,
          w: 148,
          h: 56,
          label: { en: "DynamoDB", es: "DynamoDB" },
          sublabel: { en: "invoices · config", es: "facturas · config" },
          detail: {
            en: "Invoices and their state, and the company's fiscal configuration, including which certificate signs.",
            es: "Las facturas y su estado, y la configuración fiscal de la empresa, incluido el certificado con el que se firma.",
          },
        },
        {
          id: "s3",
          kind: "store",
          x: 425,
          y: 300,
          w: 130,
          h: 56,
          label: { en: "S3", es: "S3" },
          sublabel: { en: "certificates", es: "certificados" },
          detail: {
            en: "The signing certificates, stored next to the rest of the invoicing data.",
            es: "Los certificados de firma, guardados junto al resto de los datos de facturación.",
          },
        },
        {
          id: "dlq",
          kind: "topic",
          x: 620,
          y: 304,
          w: 168,
          h: 48,
          label: { en: "DLQ", es: "DLQ" },
          sublabel: { en: "after 1 s · 2 s · 4 s", es: "tras 1 s · 2 s · 4 s" },
          detail: {
            en: "A message that still fails after retries with exponential backoff is parked here. Offsets are committed by hand, only after a message was processed or parked.",
            es: "Un mensaje que sigue fallando tras los reintentos con backoff exponencial queda aquí. Los offsets se confirman a mano, solo después de procesar o apartar el mensaje.",
          },
        },
        sri,
      ],
      edges: [
        toTopic,
        fromTopic,
        {
          id: "invoicing-invoices",
          from: { node: "invoicing", side: "top", at: 0.3 },
          to: { node: "invoices", side: "bottom", at: 0.3 },
          kind: "event",
          label: { en: "publishes", es: "publica" },
        },
        {
          id: "invoices-invoicing",
          from: { node: "invoices", side: "right" },
          to: { node: "invoicing", side: "right", at: 0.25 },
          kind: "event",
        },
        toSri,
        {
          id: "invoicing-dynamodb",
          from: { node: "invoicing", side: "bottom", at: 0.15 },
          to: { node: "dynamodb", side: "top" },
          kind: "request",
        },
        {
          id: "invoicing-s3",
          from: { node: "invoicing", side: "bottom", at: 0.5 },
          to: { node: "s3", side: "top" },
          kind: "request",
        },
        {
          id: "invoicing-dlq",
          from: { node: "invoicing", side: "bottom", at: 0.85 },
          to: { node: "dlq", side: "top" },
          kind: "event",
        },
      ],
    },
  ],
};

export const diagrams = {
  maderable: maderableArchitecture,
  faclab: faclabInvoicing,
} satisfies Record<string, DiagramFigure<Localized>>;

export type DiagramId = keyof typeof diagrams;

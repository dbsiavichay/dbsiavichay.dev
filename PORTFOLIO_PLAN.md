# PORTFOLIO_PLAN

Plan de producto, contenido e ingeniería del portfolio de **Denis Siavichay**. Lo usamos para decidir qué construir, por qué y con qué evidencia. Se actualiza al cerrar cada fase.

> **Regla de contenido.** Nada se inventa: empresas, cargos, fechas, métricas, clientes, tecnologías y años de experiencia salen de fuentes verificables (sección 4). Lo que falta se marca con el texto literal `TODO: CONFIRM WITH DENIS` y se lista en la sección 17.

---

## 1. Objetivo

Reemplazar el sitio Django de 2020–2021 (plantilla con barras de "Python 90%") por un portfolio que demuestre **cómo construye software Denis**: proyectos reales, decisiones de arquitectura, case studies técnicos y un sitio que, en sí mismo, está bien construido, probado y desplegado.

Imagen que debe transmitir: **Software Engineer orientado a producto, backend, arquitectura y construcción de sistemas reales.**

Criterio de éxito (pregunta §30 del brief): *si se elimina la sección Stack, ¿el resto del sitio todavía demuestra que Denis sabe construir software?* La respuesta tiene que ser **sí**.

## 2. Audiencia

| Visitante | Qué necesita en menos de un minuto | Dónde lo encuentra |
|---|---|---|
| Engineering Manager | Qué tipo de problemas resuelve y con qué criterio | What I Build, Featured Work, How I Work |
| CTO / Founder | Si puede llevar un problema de negocio a producción solo | Case study de Maderable, Colophon |
| Technical Recruiter | Rol, experiencia, stack y contacto | Hero, Experience, Stack, Contact |
| Software Engineer | Profundidad técnica real y trade-offs honestos | Engineering Notes, diagramas, código del repo |

## 3. Propuesta de valor

**Posicionamiento:** construye software para la operación de un negocio (cotizar, producir, facturar, agendar). Parte del modelo de dominio y llega hasta el pipeline de deploy, y elige la arquitectura según el problema, no por moda.

**Borrador del Hero** (se pule en la Fase 3):

| | EN | ES |
|---|---|---|
| Eyebrow | Denis Siavichay · Software Engineer | Denis Siavichay · Software Engineer |
| Título | I build the software a business runs on. | Construyo el software con el que opera un negocio. |
| Bajada | Quoting, inventory, invoicing, production — modeled from the domain up and shipped with the pipeline that keeps it reliable. | Cotización, inventario, facturación, producción: modelado desde el dominio y entregado con el pipeline que lo mantiene confiable. |
| CTAs | See the work · Get in touch | Ver proyectos · Contactar |
| Ubicación | Based in Ecuador · remote (UTC−5) | En Ecuador · remoto (UTC−5) |

## 4. Fuentes de evidencia

| Fuente | Qué aporta |
|---|---|
| CV de junio de 2024 y export de LinkedIn de 2023 | Historial laboral, educación, idiomas |
| Historial de git de cada repositorio (`git shortlog`, fechas de primer y último commit) | Autoría, períodos y evolución de cada proyecto |
| Documentación de cada repo (README, `docs/`, notas de arquitectura, mensajes de commit) | Problemas, decisiones y trade-offs |
| PyPI | Paquetes publicados y fechas de releases |
| Respuestas de Denis durante la planificación | Idioma, VPS, situación laboral y restricciones de publicación |

## 5. Proyectos

Se muestran pocos proyectos, cada uno con un ángulo distinto. Todos pueden convertirse en case study.

### 5.1 Maderable: cotización, optimización de corte y producción (**proyecto principal**)

- **Qué es:** sistema de un taller de tableros de melamina en Ecuador. Cubre del despiece del cliente hasta el despacho: optimización de corte, cotización, revisión por el cliente, orden, taller (corte, canteado, trabajos adicionales) e impresión de etiquetas.
- **Relación:** cliente. Denis diseñó y construyó API, web, motor de optimización, agente de impresión e infraestructura. Es el único autor de los repositorios.
- **Período:** 2025 – presente.
- **Restricción de publicación:** se puede publicar el nombre y la arquitectura. **No se publican cifras ni benchmarks**, ni nombres de clientes del taller, ni el nombre comercial de los sistemas existentes.
- **Problema:** cotizar un despiece rápido y al menor costo de material, con el cliente presente, y llevar esa cotización sin errores hasta el taller.
- **Restricciones del negocio:**
  - espesor de sierra (kerf) y refilado de bordes;
  - veta, que define si una pieza puede rotar;
  - medio tablero como unidad de venta;
  - retazos propios y retazos que trae el cliente;
  - canto (tapacanto) por lado de pieza;
  - servicios adicionales;
  - un sistema de inventario existente que solo se puede leer.
- **Ingeniería que se puede contar:**
  - El objetivo de la optimización es el **costo**, no la colocación. El medio tablero es un "bin" real.
  - Guillotina 2D con búsqueda heurística, OR-Tools CP-SAT como apoyo exacto y un kernel en Rust que produce exactamente el mismo resultado que la implementación de referencia en Python.
  - **Determinismo:** los presupuestos de búsqueda se cuentan en unidades de trabajo, no en tiempo de reloj.
  - La cotización es viva (se re-optimiza); la orden es un snapshot inmutable.
  - En el editor manual del plano de corte, **el servidor decide qué es válido**.
  - El taller trabaja con actividades paralelas y compuertas por pieza.
  - Un agente en Windows imprime etiquetas en las impresoras del local mediante long-polling saliente.
  - Deploy con health-gate y rollback automático.
- **Arquitectura:** FastAPI organizado en vertical slices (se dice así, no "Clean Architecture"), PostgreSQL, cache opcional, React + TypeScript, Caddy y Docker Compose en un VPS, CI/CD con GitHub Actions.
- **Visualizaciones:** plano de corte interactivo con un despiece sintético, y el flujo del pedido con el inventario como consulta lateral de solo lectura.

### 5.2 Faclab: ventas, inventario y facturación electrónica SRI (producto propio)

- **Qué es:** sistema de ventas, inventario, compras y punto de venta con facturación electrónica para Ecuador (SRI).
- **Período:** 2022 – 2026. Único autor. Estado: en desarrollo; uso en producción `TODO: CONFIRM WITH DENIS`.
- **Ángulo principal: de monolito a servicios, y en parte de vuelta.**
  1. Monolito Django.
  2. Refactor hexagonal dentro del monolito.
  3. Firma electrónica extraída a un servicio.
  4. Facturación extraída a un servicio TypeScript que consume eventos de Kafka.
  5. El evento de venta pasa a llevar todos los datos (event-carried state), lo que elimina el callback HTTP.
  6. El servicio de firma se reintegra porque la separación era demasiado fina.
- **Ingeniería:**
  - Clean Architecture + CQRS en el core (FastAPI, SQLAlchemy).
  - Specification pattern y value objects (RUC, Money).
  - Máquina de estados de la factura dirigida por eventos, con retries 1 s / 2 s / 4 s y dead-letter queue.
  - OpenTelemetry en los servicios, con el contexto de traza propagado en los headers de Kafka.
  - Corrección de un bug real: un EventBus que tragaba excepciones y dejaba datos inconsistentes.

### 5.3 Grazia: gestión para un salón de belleza (cliente)

- **Qué es:** agenda, clientes, servicios, caja, gastos y fotos para un salón, diseñado phone-first.
- **Período:** 2026. Único autor. El salón no se nombra.
- **Ángulos:**
  - **Reglas de negocio donde no se pueden saltar:**
    - el doble agendamiento se impide con un constraint de exclusión GiST en PostgreSQL;
    - los precios se congelan en cada cita;
    - los pagos son append-only y las correcciones son reembolsos;
    - el cierre contable usa la zona horaria del negocio;
    - un outbox se escribe en la misma transacción.
  - **Eliminar la arquitectura que no hacía falta:** multi-tenancy y roster de profesionales construidos y luego retirados cuando el negocio resultó ser un solo salón, sin más profesionales que la persona propietaria.
  - **Operación en un VPS:** edge Caddy compartido, imágenes construidas en CI, deploy con rollback, backups con simulacros de restauración.

### 5.4 SIM: Sistema Integrado Municipal (Municipio de Morona)

- **Qué es:** sistema que centralizó procesos manuales y sistemas aislados de la institución (finanzas, talento humano, registro de la propiedad, agua potable, catastro, trámites en línea, entre otros).
- **Rol:** Software Developer y líder de un equipo de 3 (2019–2021). Uno de los dos principales contribuidores del repositorio.
- **Stack:** Django, Django REST Framework, PostgreSQL, Celery, Docker, GitLab CI.
- **Formato:** case study breve.

### 5.5 Open source

- `django-superadmin`: releases desde 2020 hasta 2026.
- `django-tracing`: auditoría de cambios en modelos.
- `django-successions`: secuencias alfanuméricas.
- `django-crudpack`: helpers CRUD.

Las versiones `gmcm-*` se mantienen bajo el grupo del Municipio.

### Proyectos descartados para el sitio

Pruebas técnicas de procesos de selección, ejercicios de cursos, plantillas y prototipos sin continuidad. No demuestran trabajo real, o no se pueden atribuir con certeza.

## 6. Experiencia (timeline)

Formato de cada entrada: **problema → acción → resultado**. Los resultados solo aparecen si están documentados.

| Período | Organización | Rol | Fuente |
|---|---|---|---|
| `TODO: CONFIRM WITH DENIS` | `TODO: CONFIRM WITH DENIS` (empleo actual) | `TODO: CONFIRM WITH DENIS` | Denis confirmó empleo + clientes |
| 2025 – presente | Independiente: proyectos para clientes y productos propios | Software Engineer | git (Maderable, Grazia) |
| 10/2021 – `TODO: CONFIRM WITH DENIS` | Jüsto (e-commerce, México, remoto) | Software Engineer | CV 2024 |
| 09/2019 – 09/2021 | Municipio del cantón Morona | Software Developer, líder de equipo (3) | CV 2024, git |
| 09/2015 – 08/2019 | Municipio del cantón Morona | Systems Analyst | CV 2024, git |
| 03/2013 – 08/2015 | Independiente (negocio local) | Freelancer | CV 2024 |

Detalle de Jüsto (según el CV de 2024):
- Funcionalidades para mejorar la conversión del sitio.
- Integraciones con servicios externos para campañas promocionales.
- Participación en la migración del sistema a microservicios en Python y, sobre todo, Node.js, sobre AWS, con métricas y monitoreo.

Cualquier resultado cuantificado queda como `TODO: CONFIRM WITH DENIS`.

**Educación:**
- Máster en Ingeniería de Software y Sistemas Informáticos, Universidad Internacional de La Rioja (2018–2019).
- Ingeniería en Sistemas, Escuela Superior Politécnica de Chimborazo.

## 7. Engineering Notes

Historias técnicas en MDX, en ambos idiomas.

| # | Título (EN) | Proyecto de origen | Tesis |
|---|---|---|---|
| 1 | Optimize for the invoice, not the layout | Maderable | El problema real no era "acomodar piezas" sino "cobrar el menor material posible", con determinismo como requisito. Sin cifras. |
| 2 | From monolith to services — and partly back | Faclab (+ contexto de Jüsto) | Extraer servicios tiene costo. La granularidad correcta se descubre, y a veces implica volver a unir. |
| 3 | Business rules where they can't be bypassed | Grazia, Maderable, Faclab | Una regla que importa vive donde ninguna ruta de código puede saltarla. |
| 4 | Following a request across Kafka | Faclab | Spans por handler, métricas, logs estructurados y contexto de traza a través de la cola. |
| 5 | Deleting the architecture you didn't need | Grazia | La complejidad se justifica con un lector real, no con un futuro hipotético. |

## 8. Sitemap

Todas las rutas existen en `/en` y en `/es`. `/` redirige según cookie > `Accept-Language` > `en`.

```text
/[lang]                         Home (secciones ancladas)
/[lang]/projects/maderable      Case study principal
/[lang]/projects/faclab
/[lang]/projects/grazia
/[lang]/projects/sim
/[lang]/notes/[slug]            5 engineering notes
/[lang]/colophon                Cómo está construido este sitio
/sitemap.xml · /robots.txt · /healthz
```

## 9. Estructura de la home

El orden va de la evidencia a la lista. El Stack queda tarde a propósito.

1. **Navbar:** skip link, anclas, selector de idioma y ⌘K.
2. **Hero + System Status:** un panel con datos reales de *este* build (commit, fecha, runtime, edge, pipeline). El sitio se describe a sí mismo.
3. **What I Build:** 4 capacidades (Business platforms, Integrations, Distributed systems, Optimization). Cada una enlaza a la evidencia.
4. **Featured Work:** Maderable destacado; Faclab y Grazia medianos; SIM compacto; franja Open source.
5. **Engineering Notes.**
6. **How I Work:** Understand, Model, Design, Build, Observe, Improve. Cada paso con un ejemplo real.
7. **Experience + Education.**
8. **Stack:** agrupado, sin porcentajes; cada tecnología indica dónde se usó cuando hay evidencia.
9. **About.**
10. **Contact + Footer:** "Let's build something useful."

## 10. Dirección visual: "Engineering meets Product"

- **Referencia:** un plano técnico, o el estudio de una consultora de ingeniería. No una plantilla de CV.
- **Base:**
  - dark-first, fondo casi negro neutro, texto off-white;
  - líneas de 1 px;
  - etiquetas en monoespaciada (`01 — WHAT I BUILD`);
  - marcas de cota como motivo gráfico (referencia a los planos de corte).
- **Color:** un solo acento cálido (ámbar). Colores semánticos solo dentro de diagramas. Sin gradientes, sin glassmorphism, sin fotos de stock.
- **Tipografía:** Geist Sans (texto y títulos) y Geist Mono (datos, etiquetas, código), self-hosted con `next/font`. Escala fluida con `clamp()`.
- **Movimiento:** fade/slide sutil al entrar, stagger corto, transiciones de pasos en diagramas. Nada flota de forma permanente. Se respeta `prefers-reduced-motion`.
- **Layout:** mobile-first, container de 1200 px, gutters de 16/24/32 px. La composición cambia en 768/1024/1440 (no solo se apila).
- **Light mode:** tokens equivalentes que siguen `prefers-color-scheme`.

## 11. Stack del sitio

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript strict | SSG para todo, Server Components por defecto, OG images y metadata nativas |
| Estilos | Tailwind CSS v4 con tokens en `@theme` | Sistema de diseño en CSS, sin runtime |
| Contenido | MDX con `@next/mdx` | Case studies como contenido, con componentes React interactivos dentro |
| Validación | Zod | Frontmatter, datos, env de build y datos de visualizaciones |
| Animación | Motion (`LazyMotion` + `domAnimation`) | Bundle pequeño, respeta reduced motion |
| Diagramas | React Flow, solo en 2 diagramas de case studies, cargado lazy | Pan, zoom y nodos inspeccionables donde aportan; el resto son diagramas estáticos |
| Íconos | Lucide React | Tree-shakeable y consistente |
| Tests | Vitest + Testing Library; Playwright + axe; Lighthouse CI | Unidad, end-to-end, accesibilidad y performance como gates |
| Calidad | ESLint (flat config), Prettier, TypeScript strict | Sin warnings evitables |
| i18n | Segmento `[lang]` y diccionarios tipados, sin librería | Dos idiomas estáticos no justifican una dependencia |

## 12. Arquitectura de la aplicación

```text
src/
├── app/[lang]/…          rutas (home, projects/[slug], notes/[slug], colophon) + OG images
├── app/{sitemap,robots}.ts · app/healthz/route.ts
├── proxy.ts              negociación de idioma en "/"
├── i18n/                 config + diccionarios en/es (es satisface el tipo de en)
├── content/              MDX por slug y por idioma: <tipo>/<slug>/{en,es}.mdx
├── data/                 perfil, experiencia, capacidades, proceso, tecnologías, social, open source
├── lib/                  content (descubrimiento + validación), schemas, env, seo, pending, utils
└── components/           ui · navigation · command · home · projects · architecture · maderable · faclab · animations
```

- **Agregar un proyecto** es agregar una carpeta `content/projects/<slug>/` con `en.mdx` y `es.mdx`. Los slugs se descubren en build, el `meta` se valida con Zod y un test exige ambos idiomas.
- **Pendientes tipados:** `pending("…")` marca un dato sin confirmar. En desarrollo se ve como badge `TODO: CONFIRM WITH DENIS`; en producción se omite. `npm run content:pending` los lista y CI los reporta como warning.
- **Rendering:** todo SSG. Las islas client se limitan a menú móvil, ⌘K, copiar email, visor del plano de corte, pipeline del pedido y diagramas React Flow. React Flow nunca se carga en la home.

## 13. Deployment e infraestructura

El portfolio se despliega en el VPS que ya opera Grazia. Ahí, un **edge Caddy** es dueño de los puertos 80/443, termina TLS para todos los sitios y enruta cada dominio hacia su proyecto por una red Docker compartida (`edge`). Agregar un sitio es agregar un archivo `sites/<sitio>.caddy`, sin tocar el ruteo de otros proyectos.

```text
                  Internet
                     │  :80 :443
                     ▼
          ┌─────────────────────┐
          │  edge / Caddy       │  TLS (Let's Encrypt), headers de seguridad
          │  sites/*.caddy      │
          └─────────┬───────────┘
                    │ red docker "edge"
         ┌──────────┴───────────┐
         ▼                      ▼
 ┌───────────────┐      ┌───────────────┐
 │ portfolio-web │      │ otros sitios  │
 │ Next.js :3000 │      │ (Grazia, …)   │
 │ standalone    │      └───────────────┘
 └───────────────┘
```

- **Imagen:** Dockerfile multi-stage (`deps` → `builder` → `runner` `node:24-alpine`), output `standalone`, usuario no-root, `NODE_ENV=production`, `HEALTHCHECK` contra `/healthz`.
- **Compose (`deploy/compose.yml`):**
  - un solo servicio, sin puertos publicados;
  - red externa `edge` con alias `portfolio-web`;
  - filesystem read-only con tmpfs para la cache, `cap_drop: ALL`, `no-new-privileges`, límite de memoria y rotación de logs.
- **Caddy (`deploy/caddy/portfolio.caddy`):**
  - snippet `security` del edge, compresión y CSP propia;
  - redirección de `www` al dominio principal.
  - **Trade-off de la CSP:** las páginas estáticas de Next.js usan scripts inline, así que se permite `'unsafe-inline'` en `script-src`. Un nonce exigiría render dinámico. El sitio no tiene input de usuarios ni terceros.
- **Deploy (`deploy/scripts/deploy.sh`):** escribe el tag, hace pull y `up -d`, espera `healthy`, y si falla restaura el tag anterior.
- **Sin secretos de runtime.** Los secretos de CI viven en GitHub (environment `production`): `VPS_HOST`, `VPS_SSH_PORT`, `VPS_USER`, `VPS_SSH_KEY`.

## 14. CI/CD (GitHub Actions)

```text
Pull Request ─┬─ quality   format · lint · typecheck · unit tests · content:pending (warning)
              ├─ build     next build
              ├─ e2e       Playwright + axe sobre el build de producción
              ├─ lighthouse budgets de performance/a11y/SEO
              ├─ docker    build de la imagen (sin push)
              └─ caddy     caddy validate del sitio

push a master ─ (todo lo anterior) ─▶ publish (GHCR: sha-<7>, latest) ─▶ deploy (SSH → edge apply → deploy.sh)
```

El VPS nunca hace builds ni guarda credenciales de git: solo descarga imágenes.

## 15. Calidad

- **Vitest:**
  - contenido completo en ambos idiomas;
  - datos coherentes (orden cronológico, evidencia que apunta a slugs existentes);
  - paridad de diccionarios;
  - negociación de idioma;
  - helpers de SEO;
  - lógica de los componentes interactivos.
- **Playwright** (chromium desktop + emulación mobile):
  - rutas en ambos idiomas;
  - metadata, canonical, hreflang, JSON-LD y OG;
  - navegación por teclado y foco visible;
  - reduced motion;
  - **sin overflow horizontal** en 320, 375, 390, 430, 768, 1024, 1440 y 1920 px, con screenshots para revisión visual;
  - axe sin violaciones.
- **Lighthouse CI** (mobile): Performance ≥ 95, Accessibility = 100, Best Practices = 100, SEO = 100. JS de la home cerca de 120 KB gz como máximo.

## 16. Registro de decisiones

| # | Decisión | Alternativas | Razón |
|---|---|---|---|
| D1 | Contenedor Next.js `standalone` detrás de Caddy | `output: 'export'` servido por Caddy | Es la arquitectura pedida; da optimización de imágenes, OG images y headers. El export estático habría sido válido y más simple. |
| D2 | Unirse al edge Caddy existente | Caddy propio en el compose del portfolio | Solo un proceso puede ser dueño de 80/443; el edge ya existe para alojar varios sitios. |
| D3 | Bilingüe con `[lang]` y diccionarios propios | next-intl u otra librería | Dos idiomas estáticos; menos dependencias y menos JS. |
| D4 | MDX con `@next/mdx` y `export const meta` validado con Zod | Contentlayer, Velite, next-mdx-remote | Integración oficial, sin build paralelo; Zod da el contrato. |
| D5 | React Flow solo en 2 diagramas, cargado lazy, con fallback SSR | Usarlo en todos los diagramas | Solo aporta donde hay que explorar una topología; el resto es SVG/HTML estático. |
| D6 | Sin formulario de contacto | Formulario + backend de email | `mailto:` y copiar email resuelven el problema sin infraestructura. |
| D7 | Sin DB, Redis ni colas | — | El sitio no tiene estado. Complejidad adecuada al problema. |
| D8 | `pending()` tipado para lo no confirmado | Texto libre "TODO" | Visible en desarrollo, omitido en producción y listable en CI. |
| D9 | Imagen en GHCR, el VPS solo hace pull | Build en el VPS | No compite por CPU y memoria con producción; el rollback es cambiar de tag. |
| D10 | Maderable sin cifras | Publicar benchmarks | Restricción del cliente. |

## 17. Pendientes: `TODO: CONFIRM WITH DENIS`

- [ ] Empleo actual: empresa (o descripción por sector si es confidencial), cargo y fecha de inicio. `TODO: CONFIRM WITH DENIS`
- [ ] Mes de salida de Jüsto. `TODO: CONFIRM WITH DENIS`
- [ ] Resultados concretos en Jüsto (el CV menciona aumento de engagement y ventas, sin cifras). `TODO: CONFIRM WITH DENIS`
- [ ] Si en Jüsto (o en el empleo actual) se usaron SNS, SQS, Kafka, OpenTelemetry o SigNoz, para atribuir cada tecnología a su contexto real. `TODO: CONFIRM WITH DENIS`
- [ ] Dominio principal (`dbsiavichay.dev`) y qué hacer con `dbsiavichay.com` (¿redirigir?). `TODO: CONFIRM WITH DENIS`
- [ ] Faclab: ¿está en producción o con usuarios? `TODO: CONFIRM WITH DENIS`
- [ ] Grazia: ¿se puede publicar el nombre del producto? ¿está en producción? `TODO: CONFIRM WITH DENIS`
- [ ] Maderable: ¿se puede enlazar al sitio público del negocio? `TODO: CONFIRM WITH DENIS`
- [ ] Foto para la sección About (o ninguna). `TODO: CONFIRM WITH DENIS`
- [ ] CV actualizado en PDF para descarga (o no ofrecer descarga). `TODO: CONFIRM WITH DENIS`
- [ ] Años de la Ingeniería en Sistemas en ESPOCH (las fuentes dicen 2013 y 2015). `TODO: CONFIRM WITH DENIS`
- [ ] Handle de X/Twitter para la metadata (o ninguno). `TODO: CONFIRM WITH DENIS`

## 18. Fases

Cada fase se trabaja en su propia rama (`portfolio/fase-N-<nombre>`), termina con un commit y se pausa para revisión.

| Fase | Entregable | Estado |
|---|---|---|
| 1. Discovery | Este documento | ✅ |
| 2. Design system | Retiro de Django, scaffold de Next.js, tooling, tokens y componentes base | Pendiente |
| 3. Core | Home bilingüe completa | Pendiente |
| 4. Case studies | Maderable, Faclab, Grazia, SIM + notas | Pendiente |
| 5. Interactive engineering | Plano de corte, pipeline del pedido, diagramas, ⌘K | Pendiente |
| 6. Deployment | Dockerfile, compose, Caddy, CI/CD, documentación | Pendiente |
| 7. Quality | Tests, Lighthouse, accesibilidad, correcciones | Pendiente |
| 8. Final polish | Revisión completa + respuesta a la pregunta §30 | Pendiente |

## 19. Pregunta §30

*"Si elimino completamente la sección de Skills, ¿el resto del sitio todavía demuestra que Denis sabe construir software?"*

Se responde por escrito al cerrar la Fase 8, con referencias concretas a las secciones y páginas que lo demuestran.

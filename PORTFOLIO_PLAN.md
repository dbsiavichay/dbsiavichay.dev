# PORTFOLIO_PLAN

Plan de producto, contenido e ingeniería del portfolio de **Denis Siavichay**. Lo usamos para decidir qué construir, por qué y con qué evidencia. Se actualiza al cerrar cada fase.

> **Regla de contenido.** Nada se inventa: empresas, cargos, fechas, métricas, clientes, tecnologías y años de experiencia salen de fuentes verificables (sección 4). Lo que falta se marca con el texto literal `TODO: CONFIRM WITH DENIS` y se lista en la sección 17.

---

## 1. Objetivo

Reemplazar el sitio Django de 2020–2021 (plantilla con barras de "Python 90%") por un portfolio que demuestre **cómo construye software Denis**: proyectos reales, decisiones de arquitectura, case studies técnicos y un sitio que, en sí mismo, está bien construido, probado y desplegado.

Imagen que debe transmitir: **Software Engineer orientado a producto, backend, arquitectura y construcción de sistemas reales.**

Criterio de éxito (pregunta §30 del brief): _si se elimina la sección Stack, ¿el resto del sitio todavía demuestra que Denis sabe construir software?_ La respuesta tiene que ser **sí**.

## 2. Audiencia

| Visitante           | Qué necesita en menos de un minuto                       | Dónde lo encuentra                            |
| ------------------- | -------------------------------------------------------- | --------------------------------------------- |
| Engineering Manager | Qué tipo de problemas resuelve y con qué criterio        | What I Build, Featured Work, How I Work       |
| CTO / Founder       | Si puede llevar un problema de negocio a producción solo | Case study de Maderable, Colophon             |
| Technical Recruiter | Rol, experiencia, stack y contacto                       | Hero, Experience, Stack, Contact              |
| Software Engineer   | Profundidad técnica real y trade-offs honestos           | Engineering Notes, diagramas, código del repo |

## 3. Propuesta de valor

**Posicionamiento:** construye software para la operación de un negocio (cotizar, producir, facturar, agendar). Parte del modelo de dominio y llega hasta el pipeline de deploy, y elige la arquitectura según el problema, no por moda.

**Hero** (versión final de la Fase 3):

|           | EN                                                                                                                           | ES                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow   | Denis Siavichay · Software Engineer                                                                                          | Denis Siavichay · Software Engineer                                                                                               |
| Título    | I build the software a business runs on.                                                                                     | Construyo el software con el que opera un negocio.                                                                                |
| Bajada    | Quoting, inventory, invoicing, production — modeled from the domain up and shipped with the pipeline that keeps it reliable. | Cotización, inventario, facturación, producción: modelado desde el dominio y entregado con el pipeline que lo mantiene confiable. |
| CTAs      | See the work · Get in touch                                                                                                  | Ver proyectos · Contactar                                                                                                         |
| Ubicación | Based in Ecuador · remote, UTC−5                                                                                             | En Ecuador · remoto, UTC−5                                                                                                        |

## 4. Fuentes de evidencia

| Fuente                                                                                  | Qué aporta                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| CV de junio de 2024 y export de LinkedIn de 2023                                        | Historial laboral, educación, idiomas                         |
| Historial de git de cada repositorio (`git shortlog`, fechas de primer y último commit) | Autoría, períodos y evolución de cada proyecto                |
| Documentación de cada repo (README, `docs/`, notas de arquitectura, mensajes de commit) | Problemas, decisiones y trade-offs                            |
| PyPI                                                                                    | Paquetes publicados y fechas de releases                      |
| Respuestas de Denis durante la planificación                                            | Idioma, VPS, situación laboral y restricciones de publicación |

## 5. Proyectos

Se muestran pocos proyectos, cada uno con un ángulo distinto. Todos pueden convertirse en case study.

### 5.1 Maderable: cotización, optimización de corte y producción (**proyecto principal**)

- **Qué es:** sistema de un taller de tableros de melamina en Ecuador. Cubre del despiece del cliente hasta el despacho: optimización de corte, cotización, revisión por el cliente, orden, taller (corte, canteado, trabajos adicionales) e impresión de etiquetas.
- **Relación:** cliente. Denis diseñó y construyó API, web, motor de optimización, agente de impresión e infraestructura. Es el único autor de los repositorios.
- **Período:** 2025 – presente.
- **En producción:** el case study enlaza a `app.maderable.ec`, la app que usa el taller, que pide inicio de sesión (confirmado por Denis).
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
- **Período:** 2022 – presente. Único autor. Estado: en desarrollo, sin usuarios en producción (confirmado por Denis). El case study lo dice tal cual.
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
- **Período:** 2026. Único autor. En producción. El salón no se nombra.
- **En el sitio:** se presenta como **Grazia**, el nombre del producto, que Denis confirmó que se puede publicar. El slug sigue siendo `salon` (D19).
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

| Período            | Organización                                               | Rol                                     | Fuente                  |
| ------------------ | ---------------------------------------------------------- | --------------------------------------- | ----------------------- |
| 2025 – presente    | Independiente: proyectos para clientes y productos propios | Software Engineer                       | git (Maderable, Grazia) |
| 11/2024 – presente | Konfio (fintech, México), equipo de Cards                  | Senior Fullstack Engineer               | Denis                   |
| 10/2021 – 10/2024  | Jüsto (e-commerce, México, remoto)                         | Software Engineer                       | CV 2024, Denis          |
| 09/2019 – 09/2021  | Municipio del cantón Morona                                | Software Developer, líder de equipo (3) | CV 2024, git            |
| 09/2015 – 08/2019  | Municipio del cantón Morona                                | Systems Analyst                         | CV 2024, git            |
| 03/2013 – 08/2015  | Independiente (negocio local)                              | Freelancer                              | CV 2024                 |

La línea de tiempo se ordena por fecha de inicio, así que Independiente (2025) va antes que Konfio (11/2024).

Detalle de Konfio (según Denis): equipo de Cards, responsable de la experiencia de las tarjetas de crédito; Python, Flask y PostgreSQL.

Detalle de Jüsto (CV de 2024 y Denis):

- Funcionalidades para mejorar la conversión del sitio.
- Integraciones con servicios externos para campañas promocionales.
- Participación en la migración del monolito Django a microservicios en Python y, sobre todo, TypeScript sobre Node.js y AWS: arquitectura limpia, DynamoDB y mensajería con SNS y SQS.
- Métricas, trazas y monitoreo con OpenTelemetry y SigNoz.

No hay resultados cuantificados que publicar (Denis lo confirmó).

**Educación:**

- Máster en Ingeniería de Software y Sistemas Informáticos, Universidad Internacional de La Rioja (2018–2019).
- Ingeniería en Sistemas, Escuela Superior Politécnica de Chimborazo (2008–2015).

## 7. Engineering Notes

Historias técnicas en MDX, en ambos idiomas.

| #   | Título (EN)                                 | Proyecto de origen           | Tesis                                                                                                                           |
| --- | ------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Optimize for the invoice, not the layout    | Maderable                    | El problema real no era "acomodar piezas" sino "cobrar el menor material posible", con determinismo como requisito. Sin cifras. |
| 2   | From monolith to services — and partly back | Faclab (+ contexto de Jüsto) | Extraer servicios tiene costo. La granularidad correcta se descubre, y a veces implica volver a unir.                           |
| 3   | Business rules where they can't be bypassed | Grazia, Maderable, Faclab    | Una regla que importa vive donde ninguna ruta de código puede saltarla.                                                         |
| 4   | Following a request across Kafka            | Faclab                       | Spans por handler, métricas, logs estructurados y contexto de traza a través de la cola.                                        |
| 5   | Deleting the architecture you didn't need   | Grazia                       | La complejidad se justifica con un lector real, no con un futuro hipotético.                                                    |

## 8. Sitemap

Todas las rutas existen en `/en` y en `/es`. `/` redirige según cookie > `Accept-Language` > `en`.

```text
/[lang]                         Home (secciones ancladas)
/[lang]/projects/maderable      Case study principal
/[lang]/projects/faclab
/[lang]/projects/salon
/[lang]/projects/sim
/[lang]/notes/[slug]            5 engineering notes
/[lang]/colophon                Cómo está construido este sitio
/[lang]/…/opengraph-image       Imagen para compartir de cada página, generada en el build
/sitemap.xml · /robots.txt · /healthz
```

## 9. Estructura de la home

El orden va de la evidencia a la lista. El Stack queda tarde a propósito.

1. **Navbar:** skip link, anclas, selector de idioma y ⌘K.
2. **Hero + System Status:** un panel con datos reales de _este_ build (commit, fecha, toolchain, render, idiomas, código fuente). El sitio se describe a sí mismo. Las filas de edge y pipeline se agregan en la Fase 6, cuando existan.
3. **What I Build:** 4 capacidades (Business platforms, Integrations, Distributed systems, Optimization). Cada una enlaza a la evidencia.
4. **Featured Work:** Maderable destacado; Faclab y Grazia medianos; SIM compacto; franja Open source.
5. **Engineering Notes.**
6. **How I Work:** Understand, Model, Design, Build, Observe, Improve. Cada paso con un ejemplo real.
7. **Experience + Education.**
8. **Stack:** agrupado, sin porcentajes; cada tecnología indica dónde se usó cuando hay evidencia.
9. **About:** foto, ubicación, idiomas y educación.
10. **Contact + Footer:** "Let's build something useful."

## 10. Dirección visual: "Engineering meets Product"

- **Referencia:** un plano técnico, o el estudio de una consultora de ingeniería. No una plantilla de CV.
- **Base:**
  - dark-first, fondo casi negro neutro, texto off-white;
  - líneas de 1 px;
  - etiquetas en monoespaciada (`01 / WHAT I BUILD`);
  - marcas de cota como motivo gráfico (referencia a los planos de corte).
- **Color:** un solo acento cálido (ámbar). Colores semánticos solo dentro de diagramas. Sin gradientes (la única excepción es el glow de la terminal, D39), sin glassmorphism, sin fotos de stock.
- **Tipografía:** Geist Sans (texto y títulos) y Geist Mono (datos, etiquetas, código), self-hosted con `next/font` en subsets latinos (D32). Escala fluida con `clamp()`.
- **Movimiento:** fade/slide sutil al entrar, stagger corto, transiciones de pasos en diagramas. Nada flota de forma permanente. Se respeta `prefers-reduced-motion`.
- **Layout:** mobile-first, container de 1200 px, gutters de 16/24/32 px. La composición cambia en 768/1024/1440 (no solo se apila).
- **Light mode:** tokens equivalentes que siguen `prefers-color-scheme`.

> La segunda etapa (§20) evoluciona esta dirección hacia una identidad personal: el plano técnico sobre el escritorio de un ingeniero. El detalle está en `PERSONAL_STYLE_PROPOSAL.md`.

## 11. Stack del sitio

| Pieza      | Elección                                                                   | Por qué                                                                           |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Framework  | Next.js (App Router), React, TypeScript strict                             | SSG para todo, Server Components por defecto, OG images y metadata nativas        |
| Estilos    | Tailwind CSS v4 con tokens en `@theme`                                     | Sistema de diseño en CSS, sin runtime                                             |
| Contenido  | MDX con `@next/mdx`                                                        | Case studies como contenido, con componentes React interactivos dentro            |
| Validación | Zod                                                                        | Frontmatter, datos, env de build y datos de visualizaciones                       |
| Animación  | CSS: keyframes al cargar, scroll-driven animations y transiciones (D17)    | Cero JS para animar; los diagramas de la Fase 5 tampoco necesitaron Motion        |
| Diagramas  | React Flow, solo en 2 diagramas de case studies, cargado al explorar (D25) | Pan, zoom y nodos inspeccionables donde aportan; el resto son diagramas estáticos |
| Íconos     | Lucide React                                                               | Tree-shakeable y consistente                                                      |
| Tests      | Vitest + Testing Library; Playwright + axe; Lighthouse CI                  | Unidad, end-to-end, accesibilidad y performance como gates                        |
| Calidad    | ESLint (flat config), Prettier, TypeScript strict                          | Sin warnings evitables                                                            |
| i18n       | Segmento `[lang]` y diccionarios tipados, sin librería                     | Dos idiomas estáticos no justifican una dependencia                               |

## 12. Arquitectura de la aplicación

```text
src/
├── app/[lang]/…          rutas (home, projects/[slug], notes/[slug], colophon) + OG images
├── app/{sitemap,robots}.ts · app/healthz/route.ts
├── proxy.ts              negociación de idioma en "/"
├── i18n/                 config + diccionarios en/es (es satisface el tipo de en) + tipo Localized<T>
├── content/              MDX por slug y por idioma: <tipo>/<slug>/{en,es}.mdx (projects, notes, pages)
├── assets/               imágenes importadas estáticamente (la foto de About)
├── data/                 perfil, experiencia y educación, capacidades, proceso, stack, open source, evidencia,
│                         despiece sintético, pipeline del pedido, diagramas
├── lib/                  content (descubrimiento + validación), schemas, env, seo, pending, utils,
│                         guillotine (plano de corte), diagram (datos y enrutado de diagramas)
└── components/           ui · navigation · home · article (encabezado, índice, siguiente) · mdx (componentes del MDX)
                          command (⌘K) · architecture (diagramas) · maderable (plano de corte, pipeline del pedido)
```

- **Agregar un proyecto** es agregar una carpeta `content/projects/<slug>/` con `en.mdx` y `es.mdx`. Los slugs se descubren en build, el `meta` se valida con Zod y un test exige ambos idiomas.
- **El colophon** (`/[lang]/colophon`) es una página de tipo `pages`: el mismo MDX validado, con las mismas pruebas de cuerpo, índice y enlaces, pero con ruta propia (D35).
- **Páginas de contenido:** `/[lang]/projects/[slug]` y `/[lang]/notes/[slug]` renderizan el MDX con un índice de secciones y el tiempo de lectura, ambos leídos del propio MDX (D21). Cada página tiene su imagen OG, metadata de artículo y JSON-LD `TechArticle` + `BreadcrumbList`.
- **Textos:** la copia de interfaz (títulos de sección, botones, hero, about) vive en los diccionarios; el contenido estructurado de `src/data` escribe su texto como `Localized<T>`, así que una traducción faltante es un error de tipos (D18).
- **Evidencia:** capacidades, pasos del proceso, experiencia y stack apuntan a `project(slug)`, `job(id)` o `thisSite`; un test exige que cada referencia exista.
- **Pendientes tipados:** `pending("…")` marca un dato sin confirmar. En desarrollo se ve como badge `TODO: CONFIRM WITH DENIS`; en producción se omite. `npm run content:pending` los lista y CI los reporta como warning.
- **Rendering:** todo SSG. Las islas client se limitan a menú móvil, selector de idioma, ⌘K, copiar email, visor del plano de corte, pipeline del pedido y figuras de diagrama. Las islas reciben los datos y las clases ya calculados en el servidor, así que ni `tailwind-merge` ni la lógica del plano de corte llegan al navegador.
- **Islas pesadas, solo donde se usan:** las figuras interactivas del MDX se cargan con `next/dynamic` (D27) y el diálogo de ⌘K en su primer uso (D28). React Flow se descarga solo al pulsar "Explorar" (D25); un test e2e verifica que no se descargue en la home ni antes de explorar.
- **Componentes del MDX:** `<CutPlan />`, `<OrderPipeline />` y `<ArchitectureDiagram name="…" />`, además de `<Aside>`. Un test exige que cada diagrama nombrado exista.

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

- **Dominio:** `dbsiavichay.dev`, con `www` redirigido al apex. `dbsiavichay.com` no está registrado, así que no hay nada que redirigir.
- **Imagen (`Dockerfile`):** multi-stage (`deps` → `builder` → `runner` `node:24-alpine`), output `standalone`, usuario `node` (no-root) sobre archivos de root, `HEALTHCHECK` contra `/healthz`. Los build args (`SITE_URL`, `BUILD_SHA`, `BUILD_TIME`) quedan también como entorno de la imagen, así que lo que se renderiza en runtime (un 404, `/healthz`) coincide con lo prerenderizado.
- **Compose (`deploy/compose.yml`):**
  - un solo servicio, sin puertos publicados;
  - red externa `edge` con alias `portfolio-web`;
  - filesystem read-only con tmpfs para `.next/cache`, `init`, `cap_drop: ALL`, `no-new-privileges`, 256 MB de memoria y rotación de logs. Next no escribe a disco lo que renderiza en runtime (D30).
- **Caddy (`deploy/caddy/portfolio.caddy`):**
  - snippet `security` del edge, CSP y `Permissions-Policy` propias;
  - compresión zstd/gzip en Caddy: se le pide a Next la respuesta sin comprimir;
  - el dominio va escrito en el archivo (D29) y `www` redirige con 301 al apex.
  - **Trade-off de la CSP:** las páginas estáticas de Next.js usan scripts inline, así que se permite `'unsafe-inline'` en `script-src`. Un nonce exigiría render dinámico. El sitio no tiene input de usuarios ni terceros. Verificado sin violaciones en las páginas, ⌘K y React Flow.
- **Deploy (`deploy/scripts/deploy.sh`):** valida el tag, lo escribe, hace pull y `up -d`, espera `healthy` y, si algo falla, restaura el tag anterior. Conserva en disco la imagen actual y la anterior.
- **Edge (`deploy/scripts/apply-edge.sh`):** instala `portfolio.caddy` en `/opt/edge/caddy/sites/` y aplica el edge. Si Caddy lo rechaza, devuelve el archivo anterior: un archivo roto en disco bloquearía los deploys de Grazia (D29).
- **Ensayo (`deploy/smoke/`):** levanta el `compose.yml` real detrás de un Caddy con el snippet `security` del edge y lo prueba: health, redirecciones, headers, 404, filesystem read-only y logs. Corre en local y en CI.
- **Sin secretos de runtime.** Los secretos de CI viven en GitHub (environment `production`): `VPS_HOST`, `VPS_SSH_PORT`, `VPS_USER`, `VPS_SSH_KEY`.
- **Runbook:** `deploy/README.md` (primer deploy, rollback, verificación y ensayo local).

## 14. CI/CD (GitHub Actions)

```text
Pull Request ─┬─ quality       format · lint · typecheck · unit tests · content:pending (warning)
              ├─ e2e           next build · Playwright + axe sobre el build de producción
              ├─ lighthouse    next build · budgets de performance/a11y/SEO
              ├─ docker        build de la imagen · ensayo con deploy/smoke (sin push)
              └─ deploy config shellcheck · compose config · caddy validate · caddy fmt

push a master ─ (todo lo anterior) ─▶ publish (GHCR: sha-<7>, latest)
              ─▶ deploy (SSH → deploy.sh → apply-edge.sh → /healthz en vivo)
```

- `publish` sube la misma imagen que ensayó `docker`, guardada como artifact, sin reconstruirla (D31).
- `deploy` arranca primero el contenedor y después instala la ruta en el edge: la ruta entra solo cuando el servidor detrás está sano, y un deploy fallido no toca el edge. El último paso entra por DNS, TLS y el edge, y pasa solo si `/healthz` reporta el commit recién publicado.
- Un deploy a la vez (`concurrency: deploy-production`); un push a `master` nunca cancela uno en curso.
- Un deploy recrea el único contenedor: el sitio responde 502 mientras arranca el servidor nuevo (medio segundo en el ensayo local). Un portfolio estático no justifica blue-green.
- Cada job fija su imagen de runner (`ubuntu-24.04`): `ubuntu-latest` cambia de versión cuando GitHub decide, no con un commit. Pasar a la siguiente es un PR, que revisan los mismos jobs.
- `e2e` sube siempre el reporte de Playwright: trae los screenshots de cada layout en cada ancho, para revisión visual.

El VPS nunca hace builds ni guarda credenciales de git: solo descarga imágenes.

## 15. Calidad

- **Vitest:**
  - contenido completo en ambos idiomas, con la misma estructura de secciones;
  - ids del índice iguales a los del MDX renderizado, enlaces internos que apuntan a páginas existentes del mismo idioma y enlaces al repositorio que apuntan a archivos que existen;
  - confidencialidad: ningún nombre vetado (D24) y ninguna cifra en lo escrito a partir de Maderable;
  - datos coherentes (orden cronológico, evidencia que apunta a slugs existentes);
  - paridad de diccionarios;
  - negociación de idioma;
  - helpers de SEO;
  - el plano de corte es cortable: piezas completas, sin solapes, la veta no rota, ningún corte atraviesa una pieza y cada milímetro cuadrado se explica (D26);
  - diagramas: ningún conector atraviesa un nodo ajeno y cada texto cabe en su caja;
  - las fuentes cubren cada carácter que escribe el sitio (D32);
  - lógica de los componentes interactivos (⌘K, plano de corte, pipeline).
- **Playwright** (chromium desktop + emulación mobile):
  - rutas en ambos idiomas;
  - metadata, canonical, hreflang, JSON-LD y OG;
  - navegación por teclado y foco visible;
  - reduced motion;
  - ⌘K, plano de corte, pipeline y diagramas, con axe también sobre el canvas de React Flow y el diálogo abierto;
  - React Flow no se descarga en la home ni antes de explorar;
  - **sin overflow horizontal** en 320, 375, 390, 430, 768, 1024, 1440 y 1920 px, con screenshots para revisión visual. Dentro de la página, solo hace scroll lateral lo que lo hace a propósito: un grupo con nombre que el teclado puede enfocar (los diagramas);
  - axe sin violaciones.
- **Lighthouse CI** (mobile): Performance ≥ 95, Accessibility = 100, Best Practices = 100, SEO = 100. Presupuestos de bytes transferidos: JS ≤ 150 KB en la home y ≤ 165 KB en case studies y notas (D33); fuentes ≤ 70 KB.

## 16. Registro de decisiones

| #   | Decisión                                                                                                                                                               | Alternativas                                                                | Razón                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Contenedor Next.js `standalone` detrás de Caddy                                                                                                                        | `output: 'export'` servido por Caddy                                        | Es la arquitectura pedida; da optimización de imágenes, OG images y headers. El export estático habría sido válido y más simple. La optimización de imágenes al final no se usa (D34); el colophon cuenta el trade-off.                                                                                                                                                                             |
| D2  | Unirse al edge Caddy existente                                                                                                                                         | Caddy propio en el compose del portfolio                                    | Solo un proceso puede ser dueño de 80/443; el edge ya existe para alojar varios sitios.                                                                                                                                                                                                                                                                                                             |
| D3  | Bilingüe con `[lang]` y diccionarios propios                                                                                                                           | next-intl u otra librería                                                   | Dos idiomas estáticos; menos dependencias y menos JS.                                                                                                                                                                                                                                                                                                                                               |
| D4  | MDX con `@next/mdx` y `export const meta` validado con Zod                                                                                                             | Contentlayer, Velite, next-mdx-remote                                       | Integración oficial, sin build paralelo; Zod da el contrato.                                                                                                                                                                                                                                                                                                                                        |
| D5  | React Flow solo en 2 diagramas, cargado lazy, con fallback SSR                                                                                                         | Usarlo en todos los diagramas                                               | Solo aporta donde hay que explorar una topología; el resto es SVG/HTML estático.                                                                                                                                                                                                                                                                                                                    |
| D6  | Sin formulario de contacto                                                                                                                                             | Formulario + backend de email                                               | `mailto:` y copiar email resuelven el problema sin infraestructura.                                                                                                                                                                                                                                                                                                                                 |
| D7  | Sin DB, Redis ni colas                                                                                                                                                 | —                                                                           | El sitio no tiene estado. Complejidad adecuada al problema.                                                                                                                                                                                                                                                                                                                                         |
| D8  | `pending()` tipado para lo no confirmado                                                                                                                               | Texto libre "TODO"                                                          | Visible en desarrollo, omitido en producción y listable en CI.                                                                                                                                                                                                                                                                                                                                      |
| D9  | Imagen en GHCR, el VPS solo hace pull                                                                                                                                  | Build en el VPS                                                             | No compite por CPU y memoria con producción; el rollback es cambiar de tag.                                                                                                                                                                                                                                                                                                                         |
| D10 | Maderable sin cifras                                                                                                                                                   | Publicar benchmarks                                                         | Restricción del cliente.                                                                                                                                                                                                                                                                                                                                                                            |
| D11 | ESLint 9                                                                                                                                                               | ESLint 10                                                                   | Los plugins que trae `eslint-config-next` (react, jsx-a11y, import) todavía no declaran soporte para ESLint 10.                                                                                                                                                                                                                                                                                     |
| D12 | Node ≥ 22.12 en local; Node 24 en CI y Docker; jsdom 28                                                                                                                | jsdom 30                                                                    | jsdom 30 exige Node 22.22+; con la 28 los tests corren igual en local y en CI.                                                                                                                                                                                                                                                                                                                      |
| D13 | Íconos de marca (GitHub, LinkedIn) como SVG propios                                                                                                                    | Otra librería de íconos                                                     | Lucide v1 retiró las marcas; dos SVG de Simple Icons (CC0) no justifican otra dependencia.                                                                                                                                                                                                                                                                                                          |
| D14 | 404 localizada con un catch-all `[lang]/[...missing]`                                                                                                                  | `global-not-found` (experimental)                                           | La 404 se muestra dentro del layout y en el idioma de la ruta, con status 404, sin flags experimentales.                                                                                                                                                                                                                                                                                            |
| D15 | Style guide en `/[lang]/design-system`, solo en desarrollo                                                                                                             | Storybook                                                                   | Revisión visual de tokens y componentes sin otra herramienta; en producción responde 404.                                                                                                                                                                                                                                                                                                           |
| D16 | Paleta de Tailwind desactivada; solo existen los tokens                                                                                                                | Paleta por defecto + tokens                                                 | Ningún color fuera del sistema puede colarse en un componente.                                                                                                                                                                                                                                                                                                                                      |
| D17 | Animaciones de la home en CSS (keyframes + scroll-driven)                                                                                                              | Motion en la home                                                           | Sin JS ni hidratación para animar. La entrada al cargar no toca el H1 ni la bajada (LCP); al hacer scroll solo hay desplazamiento, nunca opacidad, para no bajar el contraste a mitad de la animación.                                                                                                                                                                                              |
| D18 | Contenido estructurado con `Localized<T>` en `src/data`                                                                                                                | Todo el texto en los diccionarios                                           | Cada hecho (fechas, stack, evidencia) queda junto a su texto en ambos idiomas; el tipo exige las dos traducciones.                                                                                                                                                                                                                                                                                  |
| D19 | El proyecto de Grazia se publica como "Grazia", con el slug `salon`                                                                                                    | Cambiar el slug a `grazia` con una redirección                              | Denis confirmó el nombre en la Fase 8. La URL `/projects/salon` ya estaba publicada y un slug no se lee como un título: cambiarlo exigía una redirección sin ganar nada.                                                                                                                                                                                                                            |
| D20 | En producción, un rango de fechas con un extremo sin confirmar no se muestra                                                                                           | Mostrar solo el inicio                                                      | "2008" solo se lee como año de graduación y "oct 2021" solo como un mes: sería un dato falso.                                                                                                                                                                                                                                                                                                       |
| D21 | Índice y tiempo de lectura leídos del MDX; el `h2` deriva su id con el mismo `slugify`                                                                                 | Plugins remark/rehype                                                       | Con Turbopack los plugins solo se configuran como strings y habría que duplicar la configuración en Vitest. Un test renderiza cada cuerpo y compara sus ids con el índice.                                                                                                                                                                                                                          |
| D22 | Un slug desconocido llama a `notFound()` en la página                                                                                                                  | `dynamicParams = false`                                                     | Con `dynamicParams = false` el servidor standalone registra un `NoFallbackError` interno por cada URL desconocida. El standalone incluye `src/content`, así que la página puede validar el slug en runtime. Las imágenes OG sí usan `dynamicParams = false`.                                                                                                                                        |
| D23 | Imagen OG propia para cada case study y nota, generada en el build                                                                                                     | Una sola imagen para todo el sitio                                          | Un enlace compartido muestra el título de la página. Las rutas de imagen no heredan los params del layout, así que listan idioma × slug.                                                                                                                                                                                                                                                            |
| D24 | Nombres vetados verificados por un test con hashes SHA-256                                                                                                             | Lista en texto plano                                                        | El repo es público: la lista en claro publicaría justo lo que protege.                                                                                                                                                                                                                                                                                                                              |
| D25 | React Flow se carga al pulsar "Explorar"; el dibujo estático es un SVG generado de los mismos datos                                                                    | Cargarlo al entrar en pantalla o en idle                                    | Quien solo lee no descarga ni ejecuta React Flow, y Lighthouse no lo paga. Ambos modos usan el mismo enrutado de conectores, así que dibujan exactamente lo mismo; el SVG trae además una versión en texto.                                                                                                                                                                                         |
| D26 | El plano de corte se describe como un árbol de guillotina y su geometría se deriva en el build                                                                         | Coordenadas escritas a mano                                                 | El dibujo solo puede mostrar planos que una sierra puede cortar, como en Maderable, donde el servidor decide qué es válido. Los tests rechazan un plano inválido y el navegador recibe solo la geometría.                                                                                                                                                                                           |
| D27 | Las figuras interactivas del MDX se cargan con `next/dynamic`, con SSR                                                                                                 | Importarlas directamente                                                    | La home y el navbar (⌘K) importan los MDX para leer su `meta`, y con ellos los componentes del MDX: sin la división, su JS viajaba en todas las páginas. Siguen prerenderizadas.                                                                                                                                                                                                                    |
| D28 | ⌘K con `<dialog>` nativo y el patrón combobox + listbox, sin librería; el diálogo se carga en su primer uso                                                            | cmdk, Radix                                                                 | El navegador ya resuelve top layer, foco atrapado y Escape. La búsqueda ignora tildes y mayúsculas, y los grupos se ordenan por su mejor resultado. En la home solo suma el botón.                                                                                                                                                                                                                  |
| D29 | El deploy del portfolio instala su propio `portfolio.caddy` en el edge, con el dominio escrito en el archivo                                                           | Agregarlo a `grazia-infra`; mover el edge a un repo propio                  | Agregar un sitio no edita otro proyecto. Como cada deploy de Grazia aplica el edge, `apply-edge.sh` solo deja en disco un archivo que Caddy aceptó. Mover el edge a su propio repo sigue siendo el paso más limpio cuando lleguen más proyectos.                                                                                                                                                    |
| D30 | Next no escribe a disco lo que renderiza en runtime (`experimental.isrFlushToDisk: false`)                                                                             | Volumen escribible para `.next/server`; `dynamicParams = false` (ver D22)   | Lo único que se renderiza en runtime son los 404 de slugs desconocidos. Escritos a disco, rompían el filesystem read-only y cualquier URL inventada habría hecho crecer el disco; en memoria los acota el LRU de Next. Lo prerenderizado se sigue leyendo del disco.                                                                                                                                |
| D31 | CI publica la imagen que ensayó (`docker save` → artifact → push)                                                                                                      | Reconstruirla en el job de publish                                          | La imagen en GHCR es la misma que pasó el ensayo con compose y Caddy, no una parecida.                                                                                                                                                                                                                                                                                                              |
| D32 | Geist en subsets propios (latín, latín-1, puntuación tipográfica y flechas) con `next/font/local`                                                                      | Las fuentes completas del paquete `geist`; `next/font/google`               | Cada página precarga las dos fuentes: completas pesaban 138 KB antes del primer pintado, y Lighthouse las cuenta en el LCP simulado. Los subsets conservan el eje de peso y todas las features OpenType en 62 KB, y el LCP mobile de la home bajó de ~2.4 s a ~2.0 s. `next/font/google` haría depender cada build de la red. Un test falla si el sitio escribe un carácter que el subset no cubre. |
| D33 | Presupuesto de JS transferido: 150 KB en la home, 165 KB en case studies y notas                                                                                       | Los ~120 KB que planteaba §15                                               | React y Next ocupan ~131 KB gz en cada página; el código propio de la home suma ~9 KB. Llegar a 120 KB exigiría quitar el framework. El margen absorbe cambios pequeños y una regresión real lo rompe, como React Flow colándose en la home.                                                                                                                                                        |
| D34 | La foto de About se recorta y se codifica una vez (WebP 640 × 800, el doble de lo que se muestra) y se sirve con `next/image` `unoptimized`                            | Optimización de `next/image` en runtime                                     | El servidor no redimensiona imágenes: sin `sharp` en el contenedor de solo lectura, sin caché de imágenes en el tmpfs ni trabajo en la primera visita. Una sola imagen de 18 KB no justifica un `srcset`. Viaja con hash en `/_next/static/media`, con caché inmutable.                                                                                                                             |
| D35 | El colophon es contenido MDX de tipo `pages`, enlazado desde el panel del build, el footer, ⌘K y cada "este sitio" del stack                                           | Una página escrita en TSX; no tenerlo                                       | Quien quiere saber cómo está hecho el sitio llega desde el dato que lo afirma. Como MDX, pasa por las mismas pruebas que los case studies, y un test exige que cada enlace al repositorio apunte a un archivo que existe.                                                                                                                                                                           |
| D36 | Paleta P1 "Graphite & lamp": grafito cálido y el mismo ámbar; la terminal y la sintaxis son oscuras en los dos temas                                                   | P2 "Night terminal", P3 "Monochrome keycap"; una terminal que sigue el tema | Conserva la marca (el ámbar) y le suma la calidez del escritorio. Una terminal es una pantalla: en el tema claro sigue oscura, y una sola sintaxis se verifica una sola vez.                                                                                                                                                                                                                        |
| D37 | El contraste de los tokens lo verifica un test que lee `globals.css`                                                                                                   | Verificarlo a mano; confiar solo en axe                                     | axe mide los pares que la página renderiza; el test mide cada par de los dos temas, también los de tokens que todavía no se usan (terminal, keycaps), y falla si las imágenes OG, el `theme-color` o el favicon se separan del CSS.                                                                                                                                                                 |
| D38 | La mono tiene dos roles: `label-mono` (rótulos) y `path-mono` (rutas, comandos y teclas). La bajada de un título display es un paso de la escala, `text-lede`          | Solo la mono en mayúsculas; `text-xl` como bajada                           | Una ruta o un comando en mayúsculas ya no es algo que se pueda pegar en una terminal. Con el H1 a 76 px, una bajada de 24 px le restaba contraste; ahora es un token y no una combinación de clases repetida.                                                                                                                                                                                       |
| D39 | El glow ámbar detrás de la terminal es el único gradiente del sitio (`lamp-glow`): solo en el tema oscuro y desde `lg`                                                 | Mantener el "sin gradientes" del §10; una sombra bajo la ventana            | Es la luz de la lámpara (bias lighting): da la calidez del escritorio sin una foto. Está en un solo lugar, es transparente en el tema claro y vive como utilidad en `globals.css`, así que otro gradiente exige otra decisión.                                                                                                                                                                      |
| D40 | El borde de un keycap es una sombra, y `keycap-pressed` solo cambia variables                                                                                          | Un `border-bottom` más grueso                                               | Al pulsar, la cara baja lo mismo que la sombra se acorta, así que nada alrededor se mueve. Como el estado presionado solo asigna variables, gana sobre `keycap` sin depender del orden en que Tailwind emite las utilidades. Los componentes cliente usan la utilidad y no `Kbd`, para no llevar `cn` al navegador.                                                                                 |
| D41 | La entrada de la terminal es CSS: el comando se tipea con `steps()` y `clip-path`, la salida se imprime línea a línea (solo opacidad) y el cursor parpadea cinco veces | `rise` escalonado en cada fila, como decía la propuesta; tipear con JS      | Una terminal imprime las líneas, no las hace flotar. `clip-path` descubre el texto sin cambiar su ancho (sin CLS), nada necesita JS, todo va detrás de `motion-safe` y el parpadeo dura 4,5 s (WCAG 2.2.2).                                                                                                                                                                                         |
| D42 | Un stack se escribe como una línea de texto mono separada por `·` (`StackLine`), en las tarjetas, la experiencia y el encabezado del case study                        | Badges                                                                      | Una fila de badges es otra fila de cajas (el problema 2 de la propuesta). Una línea se lee como en un README, y se corta entre tecnologías, nunca dentro de una.                                                                                                                                                                                                                                    |
| D43 | Los h2 del texto largo se numeran con un contador CSS cuyo texto alternativo está vacío (`content: "02 / " / ""`)                                                      | Escribir el número en el MDX o en el componente `H2`                        | Los ids, el índice y el contenido no cambian, y un lector de pantalla lee el título solo. Donde el navegador no entiende el texto alternativo, el número no aparece.                                                                                                                                                                                                                                |
| D44 | La sección que se está leyendo la sigue una isla mínima (`ReadingStatus`, ~0,8 KB gz): marca el link del índice con `aria-current="location"` y la cursorline es CSS   | Renderizar el índice en el cliente; `IntersectionObserver`                  | El índice sigue siendo HTML del servidor; la isla solo calcula el último h2 que cruzó la línea de lectura. Solo la cargan los artículos (la home la precarga con el link al colophon: +1,2 KB, dentro del presupuesto).                                                                                                                                                                             |
| D45 | El dibujo del teclado se genera de la distribución del K2 en `lib/keyboard.ts` (filas de anchos en unidades), y `profile.workspace.photo` lo reemplaza cuando exista   | Un SVG dibujado a mano; una foto generada                                   | Como el plano de corte, el dibujo solo puede mostrar un teclado coherente: los tests exigen 84 teclas en seis filas de 16 u, sin solaparse. La foto real entra sin rediseñar nada.                                                                                                                                                                                                                  |

## 17. Pendientes: `TODO: CONFIRM WITH DENIS`

- [x] Empleo actual: Konfio (fintech, México), Senior Fullstack Engineer desde noviembre de 2024, equipo de Cards.
- [x] Salida de Jüsto: octubre de 2024.
- [x] Resultados concretos en Jüsto: no hay cifras que publicar.
- [x] Tecnologías en Jüsto: SNS, SQS, OpenTelemetry y SigNoz, además de TypeScript, DynamoDB y arquitectura limpia en los microservicios. Kafka sigue atribuido solo a Faclab.
- [x] Dominio principal: `dbsiavichay.dev` (registrado, DNS en Spaceship). `dbsiavichay.com` no está registrado, así que no hay nada que redirigir.
- [x] Faclab: en desarrollo, sin usuarios en producción.
- [x] Grazia: en producción, y el nombre del producto se puede publicar.
- [x] Maderable: se enlaza `app.maderable.ec`, la app en producción.
- [x] Nivel de inglés: intermedio.
- [x] Foto para la sección About (D34).
- [ ] CV actualizado en PDF para descarga (o no ofrecer descarga). `TODO: CONFIRM WITH DENIS`
- [x] Ingeniería en Sistemas en ESPOCH: 2008–2015.
- [x] Handle de X/Twitter: ninguno por ahora. Las tarjetas se generan sin `twitter:creator`.

## 18. Fases

Cada fase se trabaja en su propia rama (`portfolio/fase-N-<nombre>`), termina con un commit y se pausa para revisión.

| Fase                       | Entregable                                                                | Estado |
| -------------------------- | ------------------------------------------------------------------------- | ------ |
| 1. Discovery               | Este documento                                                            | ✅     |
| 2. Design system           | Retiro de Django, scaffold de Next.js, tooling, tokens y componentes base | ✅     |
| 3. Core                    | Home bilingüe completa                                                    | ✅     |
| 4. Case studies            | Maderable, Faclab, Grazia, SIM + notas                                    | ✅     |
| 5. Interactive engineering | Plano de corte, pipeline del pedido, diagramas, ⌘K                        | ✅     |
| 6. Deployment              | Dockerfile, compose, Caddy, CI/CD, documentación                          | ✅     |
| 7. Quality                 | Tests, Lighthouse, accesibilidad, correcciones                            | ✅     |
| 8. Final polish            | Datos confirmados, colophon, revisión completa y respuesta a §30          | ✅     |

## 19. Pregunta §30

_"Si elimino completamente la sección de Skills, ¿el resto del sitio todavía demuestra que Denis sabe construir software?"_

**Respuesta (cierre de la Fase 8): sí.** La sección Stack (`06` de la home) es un índice, no una prueba. Cada tecnología que lista ya aparece, con su contexto, en el encabezado de un case study o en una entrada de la experiencia, y ninguna otra sección depende de ella: los enlaces de evidencia apuntan a case studies, a empleos o al colophon. Si se quita, esto es lo que sigue demostrando que Denis sabe construir software:

1. **Los case studies cuentan decisiones, no herramientas.**
   - [`/projects/maderable`](https://dbsiavichay.dev/en/projects/maderable): reformular el problema (se optimiza el costo, no la colocación; el medio tablero es un bin real), determinismo con presupuestos en unidades de trabajo, un kernel en Rust que devuelve exactamente lo mismo que la referencia en Python, una cotización viva frente a una orden inmutable, el servidor como única autoridad sobre lo que es válido, un agente de impresión con entrega al-menos-una-vez y un hueco conocido escrito en vez de escondido. El plano de corte interactivo es un árbol de guillotina que los tests verifican (D26), y el sistema está en producción.
   - [`/projects/faclab`](https://dbsiavichay.dev/en/projects/faclab): cinco formas de arquitectura en cuatro años, con el criterio para extraer un servicio y para volver a unirlo; un evento que lleva el estado en vez de forzar un callback; un bug real (un event bus que se tragaba excepciones) y su arreglo; reintentos, DLQ y trazas a través de Kafka.
   - [`/projects/salon`](https://dbsiavichay.dev/en/projects/salon) (Grazia, en producción): reglas de negocio donde nada puede saltarlas (constraint de exclusión GiST, precios congelados, pagos append-only, cierre en la zona horaria del negocio, outbox en la misma transacción), arquitectura retirada cuando no tenía lector, y operación real: edge compartido, deploys con rollback, backups con simulacros de restauración.
   - [`/projects/sim`](https://dbsiavichay.dev/en/projects/sim): liderar a un equipo de tres en el sistema que reunió los procesos de una institución pública.
2. **Las notas de ingeniería (`03`) generalizan el criterio.** Cinco tesis, cada una con su trade-off: optimizar la factura y no el layout, de monolito a servicios y en parte de vuelta, reglas donde no se pueden saltar, seguir una petición a través de Kafka, borrar la arquitectura que no hacía falta.
3. **La home sostiene cada afirmación con evidencia.** What I Build (`01`) enlaza cada capacidad al trabajo que la demuestra, How I Work (`04`) da un ejemplo real para cada paso, y Experience (`05`) cuenta problema, acción y, donde está documentado, resultado: del municipio a Jüsto, Konfio y el trabajo independiente.
4. **El propio sitio es evidencia que se puede inspeccionar.** El panel del build en el hero, el [colophon](https://dbsiavichay.dev/en/colophon) y el repositorio público muestran contenido verificado por tests, presupuestos de performance y accesibilidad que bloquean un merge, un ensayo de la imagen con Compose y Caddy antes de publicarla, y un deploy con health gate, rollback y verificación desde afuera, en un servidor compartido con la producción de un cliente.

**Lo que se pierde sin Stack:** una vista cruzada para quien busca palabras clave ("¿dónde usó X?"). Nada de su contenido es exclusivo.

**Dónde la evidencia es más delgada, dicho sin adornos:**

- Konfio, el empleo actual, tiene una sola línea de detalle; Jüsto no tiene resultados cuantificados.
- El código de los clientes y de Faclab es privado: el código que se puede leer es el de este sitio y el de los paquetes open source.
- Maderable no publica cifras (D10), así que el impacto de la optimización se muestra con el razonamiento y el plano de corte, no con números.
- El CV en PDF sigue pendiente.

## 20. Segunda etapa: identidad personal

El sitio de las fases 1–8 demuestra cómo construye software Denis, pero no dice nada de él: su setup, la terminal, Vim, el teclado mecánico. Esta etapa le da esa identidad **sin reconstruirlo ni cambiar su arquitectura**: _A software engineer's digital workspace_. El centro de la página sigue siendo el trabajo; la estética del setup tiene que contar algo verdadero o hacer algo útil.

`PERSONAL_STYLE_PROPOSAL.md` contiene la auditoría del diseño actual, tres direcciones (A — Developer Workspace, B — Terminal / Vim, C — Minimal Premium Developer), tres paletas con su contraste verificado, la mezcla recomendada (~60% C + 25% B + 15% A) y el plan por área. Denis eligió la recomendación el 2026-10-03.

Hechos del setup confirmados por Denis (2026-10-03): tiene un Keychron K2 (75%) con switches brown; usa Vim de forma ocasional y le gusta; todavía no hay una foto de su setup.

| Fase                                             | Entregable                                                                                                | Estado |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------ |
| 9. Propuesta                                     | `PERSONAL_STYLE_PROPOSAL.md`                                                                              | ✅     |
| 10. Fundamentos                                  | Tokens, tipografía y color                                                                                | ✅     |
| 11. Navbar, hero y terminal                      | Keycaps, el hero nuevo y el panel del build como terminal                                                 | ✅     |
| 12. Proyectos, case studies, experiencia y About | Rutas en las tarjetas, h2 numerados, TOC con la sección activa, riel de experiencia, figura del workspace | ✅     |
| 13. Micro-interacciones                          | Atajos de Vim con interruptor, modo comando en ⌘K, ayuda `?`, easter eggs                                 | ⏳     |
| 14. Responsive, performance y pulido             | Revisión en todos los anchos, Lighthouse y la revisión final de la propuesta                              | ⏳     |

Las decisiones de esta etapa se registran en §16 (D36 en adelante) a medida que cada fase las adopta.

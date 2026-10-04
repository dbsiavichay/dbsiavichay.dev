# PERSONAL_STYLE_PROPOSAL

Propuesta de la segunda etapa de diseño del portfolio de **Denis Siavichay**: darle una identidad personal sin reconstruirlo. Parte del sitio que ya está en producción (fases 1–8 de `PORTFOLIO_PLAN.md`) y no cambia su arquitectura técnica.

> **Estado:** Denis eligió la recomendación de la sección 5 (2026-10-03). Las fases 10 a 14 están implementadas y la revisión final (sección 8) está respondida: la etapa está cerrada.

**Principio:** _A software engineer's digital workspace._ Quien visita el sitio entra en el espacio de trabajo digital de un ingeniero. La estética del setup (terminal, Vim, teclado mecánico, escritorio, luz cálida) es parte de su personalidad, pero el centro de la página sigue siendo **su trabajo, su ingeniería y los sistemas que construye**.

**Regla fundamental:** el resultado no puede parecer _"un portfolio de programador al que le pusieron una terminal"_. Cada elemento de la estética tiene que contar algo verdadero o hacer algo útil.

---

## 1. Auditoría del diseño actual

### 1.1 Lo que hay hoy

| Área                     | Estado actual                                                                                                                                                                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Páginas                  | `/[lang]` (home con 8 secciones ancladas), 4 case studies, 5 notas, colophon, 404 localizada, `/design-system` (solo en desarrollo). Todo SSG, en inglés y en español.                                                                                                                                                      |
| Layout                   | Container de 1200 px, gutters de 16/24/32 px. Cada sección es un `Section` con una hairline arriba y el ritmo `py-section` (`clamp(4.5rem, …, 8.5rem)`). Los encabezados van en dos columnas desde `lg`: índice + eyebrow, y título + bajada.                                                                               |
| Navegación               | Header sticky con un skip link, el monograma "DS" en una caja, anclas a 5 secciones, un botón ⌘K, el selector de idioma y un menú disclosure en mobile.                                                                                                                                                                     |
| Hero                     | Dos columnas (7/5) sobre un grid de dibujo de 48 px: eyebrow mono, H1 display, bajada, CTA ámbar + CTA outline, ubicación. A la derecha, el panel **"This build"**: commit, fecha, toolchain, render, idiomas y fuente, todo leído del build.                                                                               |
| Proyectos                | Tres tamaños de tarjeta: Maderable destacada, con el boceto del plano de corte; Faclab y Grazia medianas; SIM compacta. Badge de relación, años en mono, highlights con viñeta ámbar, stack como badges y la señal "Case study ↗". Debajo, una franja open source en grilla `gap-px`.                                       |
| Case studies y notas     | Encabezado sobre el grid de dibujo (volver, eyebrow mono, H1, bajada, ficha rol/período/stack/en producción), cuerpo `prose` a 42rem, TOC sticky a la derecha desde `lg` y disclosure nativo en mobile. Figuras interactivas: plano de corte, pipeline del pedido, diagramas (React Flow al pulsar "Explorar").             |
| Experiencia              | Lista con hairlines: fecha mono a la izquierda; cargo, problema, highlights, stack y evidencia a la derecha. Educación en dos cards.                                                                                                                                                                                        |
| Stack, About, Contact    | Stack en 4 columnas sin porcentajes, cada tecnología con dónde se usó. About: foto WebP de 18 KB, párrafos y ficha (base, idiomas, educación). Contact: título display sobre el grid, `mailto:`, copiar email, cota decorativa, GitHub y LinkedIn.                                                                          |
| Tipografía               | Geist Sans (texto y títulos) y Geist Mono (datos y etiquetas), en subsets propios de 62,3 KB en total (D32). Escala fluida con `clamp()`; display de 2,25 a 4,75 rem. La mono aparece sobre todo como `label-mono`: mayúsculas, tracking 0.08em, 12 px.                                                                     |
| Color                    | Dark-first: canvas `#0a0b0d` (negro neutro, un poco azulado), off-white `#ecebe8`, tres grises de texto y **un solo acento ámbar** `#f2a541`. Colores semánticos solo en diagramas. Light mode con tokens equivalentes que siguen `prefers-color-scheme`. Paleta de Tailwind desactivada (D16).                             |
| Espaciado                | Generoso y consistente. Las secciones respiran, pero dentro de ellas todo vive en cajas.                                                                                                                                                                                                                                    |
| Cards, botones y badges  | `Card`: `rounded-lg border bg-surface`, con el borde más fuerte al hacer hover y un link estirado. Botones primary (ámbar), secondary (outline) y ghost. Badges mono. `Kbd` existe, pero solo se usa en `/design-system`.                                                                                                   |
| Animaciones              | Solo CSS (D17): `rise` al cargar (nunca en el H1 ni la bajada, que son el LCP) y `settle` con scroll-driven animations (mueve sin desvanecer). Reduced motion respetado.                                                                                                                                                    |
| Imágenes                 | Una: el retrato de About. Nada de stock. El resto son dibujos: el plano de corte, los diagramas, la cota.                                                                                                                                                                                                                   |
| Responsive               | Mobile-first. Tests sin overflow horizontal en 8 anchos (320 a 1920 px), con screenshots para revisar.                                                                                                                                                                                                                      |
| Arquitectura de frontend | Server Components por defecto. Islas: menú móvil, selector de idioma, ⌘K (diálogo cargado en el primer uso), copiar email y las figuras interactivas (`next/dynamic`). Tokens en `globals.css` (`@theme`), `cn` con `tailwind-merge` solo en el servidor, copy en diccionarios tipados y contenido en `Localized<T>` y MDX. |

### 1.2 Qué funciona bien

- **La evidencia como estructura.** Cada afirmación apunta a un case study, un empleo o al colophon. La respuesta al §30 depende de esto.
- **El panel "This build".** Es lo más personal del sitio: un ingeniero mostrando su propio pipeline con datos reales. Su contenido ya habla el idioma de la terminal.
- **El plano de corte.** Un dibujo que solo existe porque Denis construyó Maderable; une la estética con el trabajo real.
- **Un acento cálido, no verde.** El ámbar ya es la "luz de lámpara" del escritorio. No hay que cambiarlo, hay que darle un contexto.
- **El rigor:** accesibilidad, presupuestos de bytes, tests de layout, fuentes subseteadas. Es parte de la identidad ("lo trata como trabajo de cliente").
- **⌘K** con `<dialog>` nativo: ya es la puerta de entrada a una capa de teclado.

### 1.3 Qué podría tener más personalidad

- El hero: el contenido es sólido, la composición es anónima.
- La monoespaciada: hoy es solo una etiqueta y nunca aparece en su hábitat (comandos, rutas, código).
- El teclado: el sitio tiene ⌘K, pero nada lo invita a usarlo.
- About: es la única sección humana, y le falta el "dónde trabajo y con qué me gusta trabajar".
- El monograma "DS", el footer y la 404.

### 1.4 Qué podría transformarse

| Elemento actual          | En qué puede convertirse                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Panel "This build"       | La terminal del sitio: los mismos datos reales, con forma de ventana y salida estilo neofetch.     |
| Monograma "DS"           | Un keycap.                                                                                         |
| `Kbd` y la pista ⌘K      | Keycaps low-profile que se hunden al pulsarlos.                                                    |
| ⌘K                       | Además, un modo comando `:` al estilo de Vim.                                                      |
| Cabecera de las tarjetas | Una línea con la ruta `~/projects/<slug>`, como la pestaña de un editor.                           |
| Numeración del TOC       | Cursorline de la sección activa y una mini status line `NORMAL · 03/08`.                           |
| Lista de experiencia     | Un riel tipo `git log --graph`.                                                                    |
| Foto de About            | Acompañada de una figura del workspace: hoy un dibujo del teclado, mañana una foto real del setup. |
| 404                      | Una línea de shell (`cd: no such file or directory`) sobre el copy humano.                         |

### 1.5 Qué no se toca

- **El copy:** hero, títulos de sección, case studies, notas. La personalidad entra por la forma, no reescribiendo lo que ya está probado.
- **El orden de la home y la arquitectura de evidencia** (el §30 depende de ellos).
- **i18n, SSG, Server Components, el contenido en MDX y `Localized<T>`.**
- **El plano de corte, el pipeline del pedido y los diagramas** (funcionan y tienen tests).
- **El light mode.** La identidad es dark-first, pero quien prefiere modo claro lo sigue teniendo.
- **La accesibilidad y los presupuestos.** Ningún cambio se acepta si los rompe.
- **El deploy.** Esta etapa no toca `Dockerfile`, `next.config.ts` ni `deploy/`.

### 1.6 Restricciones que condicionan cualquier dirección

- **Fuentes:** el presupuesto es de 70 KB y se usan 62,3. No cabe una tercera familia. Los caracteres de caja (`─│┌┐`) y de bloque (`█`) no están en el subset, y un test exige que el subset cubra cada carácter del sitio: el chrome de la terminal se dibuja con CSS, no con glifos.
- **JS:** la home transfiere ~140 de 150 KB, y ~131 KB son React y Next (D33). Lo nuevo tiene que ser CSS, una extensión mínima de una isla existente o algo cargado en el primer uso.
- **Tests que fijan estructura:** el orden de los `main section[id] h2`, la región "This build" (con la versión de Next.js y la fecha en `YYYY-MM-DD HH:MM UTC`), que los links del nav sean anclas `#id`, y 4 `article` en `#work`.
- **WCAG 2.1.4** (Character Key Shortcuts, nivel A): los atajos de una sola tecla necesitan un mecanismo para apagarlos.
- **WCAG 2.2.2** (Pause, Stop, Hide): nada parpadea más de 5 segundos.
- **Regla de contenido:** el hardware, el editor y cualquier hecho personal nuevo pasan por `pending()` hasta que Denis los confirme (sección 7).

---

## 2. Problemas: qué se siente genérico

1. **El hero es la composición por defecto.** Texto a la izquierda y una tarjeta a la derecha es la plantilla más común de un portfolio y de una landing SaaS. El panel tiene contenido personal, pero forma de tarjeta cualquiera.
2. **Todo es una caja.** `rounded-lg border bg-surface` se repite en proyectos, capacidades, proceso, open source y educación, y cuatro secciones comparten la misma grilla `gap-px`. Cuando todo pesa igual, la jerarquía se aplana y el ojo no sabe dónde detenerse.
3. **`01 —— EYEBROW`** es un patrón muy visto en portfolios de desarrolladores.
4. **La monoespaciada está disfrazada.** Solo aparece en mayúsculas con tracking, como rótulo. Nunca escribe un comando, una ruta o un atajo, que es donde un ingeniero la reconoce como propia.
5. **La cultura de teclado es invisible.** ⌘K existe, pero solo lo encuentra quien ya lo busca.
6. **Los elementos de marca son anónimos:** el monograma en una caja, botones de librería de componentes, un footer de una línea.
7. **La persona no aparece.** Fuera de About, el sitio podría ser de una consultora de ingeniería. Esa era la referencia del §10 ("el estudio de una consultora de ingeniería"), y cumplió su propósito: ahora le falta alguien sentado al escritorio.

---

## 3. Oportunidades de identidad personal

| Elemento         | Dónde entra                                                                                     | Qué aporta además de estética                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Developer setup  | El glow detrás de la terminal (luz de monitor) y la figura del workspace en About.              | Calidez y la escena de "un espacio real", sin fotos de terceros.                                         |
| Terminal         | **Una sola:** el panel del build del hero. También la 404 y las muestras de `/design-system`.   | El sitio se describe en su idioma natural; los datos siguen siendo reales.                               |
| Vim              | Atajos (`/`, `:`, `?`, `g`+tecla, `j`/`k`), modo comando en ⌘K y la status line del TOC.        | Navegación más rápida para quien la quiera; sección activa visible al leer.                              |
| Teclado mecánico | Keycaps en `Kbd`, en el monograma y en la ayuda de atajos; dibujo de un teclado 75% en About.   | Hace visibles los atajos que antes nadie encontraba.                                                     |
| Fotografía       | Un solo lugar, About, preparado para una foto real del setup cuando exista.                     | Prueba de que el espacio es real, sin convertir el sitio en un showcase.                                 |
| UI técnica       | Rutas (`~/projects/maderable`), `pip install`, riel `git log`, h2 numerados, bloques de código. | Metadata verdadera: es la ruta real del contenido en el repo y el comando real para instalar un paquete. |

---

## 4. Tres direcciones visuales

Las tres comparten el contenido y la arquitectura. Lo que cambia es la escena, la paleta, el lugar de la terminal y del teclado, y cuánto pesa cada uno.

### A — Developer Workspace

> _"Welcome to my workspace."_

**Descripción.** El sitio como un escritorio visto de frente. El hero es una escena: un monitor (la terminal) sobre un escritorio, un teclado dibujado delante y una lámpara que tiñe la escena de ámbar. Las secciones se presentan como ventanas o papeles sobre ese escritorio, y una franja fotográfica del setup separa el trabajo de la persona.

**Paleta:** P1 "Graphite & lamp" (4.4), con el glow más presente.

**Tipografía:** Geist Sans + Geist Mono. La mono rotula los objetos del escritorio (títulos de ventana, pies de foto, etiquetas del teclado).

**Hero:**

```text
┌──────────────────────────────────────────────────────────────┐
│ SOFTWARE ENGINEER                         ░░ luz ámbar ░░     │
│                                        ┌───────────────────┐  │
│ I build the software                   │ ● ● ●  ~/denis    │  │
│ a business runs on.                    │ $ build-info      │  │
│                                        │ commit  fc2cafe   │  │
│ Quoting, inventory, invoicing…         │ $ ▍               │  │
│                                        └─────────┬─────────┘  │
│ [ See the work → ] [ Get in touch ]        ══════╧══════      │
│                                   ┌─────────────────────────┐ │
│                                   │ ▢▢▢▢▢▢▢▢▢▢▢▢▢▢ teclado  │ │
└───────────────────────────────────┴─────────────────────────┴─┘
```

**Proyectos:** cada tarjeta es una ventana con barra de título (`maderable — case study`) y una leve sombra de "objeto apoyado". La destacada se abre "en el monitor".

**Terminal:** protagonista del hero, dentro del monitor.

**Teclado:** dibujo grande en el hero; keycaps en toda la UI de atajos.

**Imágenes:** foto del setup propio en una franja a sangre entre secciones (AVIF/WebP, 3 anchos). Mientras no exista, un placeholder identificado como tal. Una imagen generada de un "setup ideal" se descarta: se vería falsa justo donde se promete algo real.

**Animaciones:** la lámpara se "enciende" al cargar (opacidad del glow), la terminal escribe y las ventanas entran con `settle`.

**Ventajas:**

- La más personal y memorable; se reconoce la afición en un segundo.
- Le da al visitante una escena, no solo una página.

**Riesgos:**

- Es la más cercana a un "setup showcase", justo lo que el brief quiere evitar.
- La escena compite con el H1 por la atención y, con una foto, por el LCP: Performance ≥ 95 en mobile queda en riesgo.
- En mobile la escena no cabe: hay que reemplazarla, no reducirla.
- Sin una foto real, el placeholder debilita toda la dirección.
- Las ventanas sobre un escritorio envejecen rápido (skeuomorfismo).

### B — Terminal / Vim

> _"$ whoami"_

**Descripción.** El sitio como una sesión de tmux con Vim abierto. El header es una barra de tmux (`[portfolio] 0:home* 1:work 2:notes`); cada sección es un "buffer" con un gutter de números de línea; una status line fija abajo muestra el modo (`NORMAL`), el archivo (`home.tsx`) y la posición (`42:17`). ⌘K se presenta como la línea de comandos `:`. Los datos (experiencia, stack) se muestran con syntax highlighting, como un archivo YAML.

**Paleta:** P2 "Night terminal" (4.4).

**Tipografía:** Geist Mono para H2, H3, navegación y toda la metadata; Geist Sans solo para el texto largo. Opción: cambiar Geist Mono por JetBrains Mono (OFL), siempre que el par siga entrando en los 70 KB.

**Hero:**

```text
┌─ denis@workspace ─────────────────────────────────────────────┐
│  1 │ $ whoami                                                  │
│  2 │ denis — software engineer                                 │
│  3 │                                                           │
│  4 │ $ cat about.txt                                           │
│  5 │ I build the software a business runs on.                  │
│  6 │                                                           │
│  7 │ $ ls projects/                                            │
│  8 │ maderable/  faclab/  salon/  sim/                         │
│  9 │ $ ▍                                                       │
├────┴──────────────────────────────────────────────────────────┤
│ NORMAL  home.tsx                              utf-8   9:3  Top │
└────────────────────────────────────────────────────────────────┘
```

**Proyectos:** listado tipo `ls -la` (permisos, fecha, nombre), y cada proyecto se abre como "buffer" con su resumen.

**Terminal:** en todas partes; es el marco del sitio.

**Teclado:** atajos de Vim en primer plano y una línea de ayuda permanente (`? help  : command  / search`).

**Imágenes:** ninguna, salvo el retrato. A lo sumo, arte ASCII.

**Animaciones:** typing en cada sección, cursor en cada buffer, transición de "modo".

**Ventajas:**

- Identidad técnica fuerte y barata: sin imágenes, muy rápida.
- Muy reconocible para otros ingenieros.

**Riesgos:**

- Es exactamente el "portfolio de programador al que le pusieron una terminal".
- Leer párrafos en mono cansa, y el H1 dentro de una terminal pierde fuerza como titular.
- CTOs, founders y recruiters (dos de los cuatro públicos del §2 del plan) leen un juego, no un ingeniero de producto.
- Una terminal falsa como marco obliga a falsear la semántica (¿un buffer es un landmark?).
- La status line fija se come pantalla en mobile.
- Envejece como gimmick.

### C — Minimal Premium Developer

> _"Pocos elementos, cada uno cuidado."_

**Descripción.** La estructura actual, refinada como lo haría alguien obsesionado con los detalles. Más espacio negativo, menos cajas (hairlines y columnas abiertas en vez de cards, salvo donde el contenedor significa algo) y tipografía editorial, con más contraste de tamaño y peso. El hardware aparece solo como detalle: un keycap, un atajo, una foto pequeña. La sensación es la de un escritorio limpio fotografiado de noche: negro, grises, una sola luz.

**Paleta:** P3 "Monochrome keycap" (4.4).

**Tipografía:** Geist Sans con un display más grande y con más aire, y titulares a peso 600 contra un cuerpo a 400. La mono se reduce a datos y atajos.

**Hero:**

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Denis Siavichay — Software Engineer                         │
│                                                              │
│  I build the software                                        │
│  a business runs on.                                         │
│                                                              │
│  Quoting, inventory, invoicing, production…                  │
│                                                              │
│  See the work →      Get in touch                 ⌘ K        │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│  commit fc2cafe · built 2026-10-03 · next 16 · en/es         │
└──────────────────────────────────────────────────────────────┘
```

**Proyectos:** sin cajas. Filas separadas por hairlines: nombre grande, una línea de metadata mono y el plano de corte de Maderable como única imagen.

**Terminal:** casi no hay. El panel del build se reduce a una línea de metadata.

**Teclado:** keycaps solo en la pista ⌘K y en la ayuda de atajos.

**Imágenes:** una foto propia y discreta en About (un detalle del teclado), con pie en mono.

**Animaciones:** casi ninguna nueva: `settle` y un hover preciso.

**Ventajas:**

- La más profesional y atemporal; no hay nada que envejezca mal.
- La más segura para Lighthouse y para la accesibilidad.
- Deja a los proyectos como protagonistas absolutos.

**Riesgos:**

- La personalidad puede quedarse demasiado sutil: el brief pide más que "lo mismo, mejor".
- "Negro, blanco y mucho aire" es también la estética de Vercel y Linear: puede leerse como un clon.
- Al reducir el panel del build a una línea se pierde lo más personal que ya tiene el sitio.
- El monocromo puro pierde la calidez que hace sentir el espacio como de alguien.

### 4.4 Paletas

Las tres están verificadas con la fórmula de contraste de WCAG 2.x. Todo texto está a ≥ 4.5:1 sobre canvas, surface y raised; `line-strong` a ≥ 3:1 (WCAG 1.4.11); el texto sobre el acento a ≥ 4.5:1; y en la terminal, cada color de texto y de sintaxis a ≥ 4.5:1 sobre el fondo y sobre la barra.

**P1 — "Graphite & lamp"** (recomendada). Grafito cálido, como un escritorio oscuro bajo una lámpara. Conserva el ámbar actual.

| Token         | Dark      | Light     | Contraste peor caso (dark / light) |
| ------------- | --------- | --------- | ---------------------------------- |
| `canvas`      | `#0c0b0a` | `#f5f3ef` | —                                  |
| `surface`     | `#131210` | `#fffdfa` | —                                  |
| `raised`      | `#1a1816` | `#faf8f4` | —                                  |
| `line-strong` | `#6e675d` | `#8a8478` | 3.52 / 3.35                        |
| `fg`          | `#eeeae3` | `#1a1814` | 14.77 / 16.00                      |
| `fg-muted`    | `#aaa398` | `#4d4840` | 7.08 / 8.18                        |
| `fg-subtle`   | `#8f887c` | `#615b51` | 5.04 / 6.07                        |
| `accent`      | `#f2a541` | `#e99a2c` | texto encima: 9.17 / 7.70          |
| `accent-text` | `#f2a541` | `#8f4c00` | 8.63 / 5.92                        |

Terminal (oscura en ambos temas): fondo `#11100e`, barra `#181613`, texto `#ece6dc`, apagado `#a39b8e`, prompt `#f2a541`. Sintaxis desaturada: string sage `#a9c18c`, keyword rosa apagado `#d99c90`, función arena `#e3c48f`, número `#9fc3c9`, comentario `#8a8276` (el más bajo: 4.76 sobre la barra).

**P2 — "Night terminal".** Grafito azulado, como el brillo de un monitor de noche, contra un cursor ámbar: el contraste frío/cálido es la idea.

| Token                           | Dark                              | Peor caso     |
| ------------------------------- | --------------------------------- | ------------- |
| `canvas` / `surface` / `raised` | `#0b0d12` / `#11141b` / `#171b24` | —             |
| `line-strong`                   | `#5f687a`                         | 3.47          |
| `fg` / `fg-muted` / `fg-subtle` | `#e6e8ee` / `#a2a9b8` / `#868ea0` | 5.24 (subtle) |
| `accent`                        | `#f0a04b`                         | 8.07          |

Sintaxis: string `#a3c9a8`, keyword `#b9a3e3`, función `#8fb8e8`, número `#e3b27c`, comentario `#7f889b` (4.99).

**P3 — "Monochrome keycap".** Grises neutros puros, como un teclado negro y gris, y un solo acento naranja: la tecla Esc de color.

| Token                           | Dark                              | Peor caso     |
| ------------------------------- | --------------------------------- | ------------- |
| `canvas` / `surface` / `raised` | `#0a0a0a` / `#111111` / `#181818` | —             |
| `line-strong`                   | `#6b6b6b`                         | 3.72          |
| `fg` / `fg-muted` / `fg-subtle` | `#f2f2f2` / `#a8a8a8` / `#8c8c8c` | 5.28 (subtle) |
| `accent` / `accent-text`        | `#ff6b35` / `#ff7d4d`             | 7.01          |

Sintaxis casi monocroma: keyword en el acento, strings en gris claro, comentarios `#8c8c8c`.

Ninguna de las tres usa negro con verde neón.

---

## 5. Recomendación

**~60% C + 25% B + 15% A**, con P1 como paleta.

### 5.1 La idea que las une

> **El sitio ya es un plano técnico. Ahora ese plano está sobre el escritorio de alguien.**

El lenguaje de plano (cotas, el plano de corte, el grid de dibujo, la hairline de 1 px) representa **el trabajo**. El workspace (la terminal, los keycaps, la luz de la lámpara) representa **a la persona**. Las dos capas se dibujan con la misma línea: hairlines, mono, un solo ámbar. Por eso conviven sin que una parezca pegada a la otra: un teclado dibujado como un plano de corte (las teclas son piezas sobre una placa) es la prueba de que es un solo idioma.

### 5.2 Qué se toma de cada dirección

| Viene de      | Elemento                                                                                                          | Por qué entra                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **C** (base)  | Sobriedad, espacio negativo, menos cajas en las secciones de lista (capacidades, proceso, stack)                  | Mantiene la calidad profesional y deja a los proyectos como protagonistas.                                           |
| **C**         | Tipografía editorial con Geist Sans; la mono en dos roles: `label-mono` (rótulos) y `path-mono` (rutas, comandos) | La mono aparece en su hábitat sin tomar el texto largo.                                                              |
| **B**         | **Una sola terminal: el panel del build**, con salida estilo neofetch y datos reales                              | Es la evolución de lo más personal que ya existe, no un adorno nuevo. La terminal aporta porque dice algo verdadero. |
| **B**         | Atajos de Vim, el modo comando `:` en ⌘K, la status line del TOC                                                  | Capa de interacción opcional y útil; nunca es la única forma de navegar.                                             |
| **B**         | Rutas, `pip install`, riel `git log`, h2 numerados                                                                | Metadata técnica verdadera, no decorativa.                                                                           |
| **A**         | Glow ámbar detrás de la terminal (bias lighting)                                                                  | La calidez del setup de Instagram sin una foto: una sola luz en un solo lugar.                                       |
| **A**         | Keycaps (monograma, `Kbd`) y el dibujo del teclado en About                                                       | La afición por el teclado mecánico como detalle, no como protagonista.                                               |
| **A**         | Figura del workspace preparada para la foto real del setup                                                        | El día que exista la foto, entra sin rediseñar nada.                                                                 |
| **P1** (de A) | Grafito cálido con el ámbar actual                                                                                | Continuidad con la marca actual y la calidez que P3 pierde.                                                          |

### 5.3 Qué se descarta, y por qué

- **De A:** la escena de escritorio en el hero (compite con el H1 y con el LCP, y no cabe en mobile), la franja fotográfica a sangre y las ventanas sobre un escritorio (skeuomorfismo que envejece).
- **De B:** la terminal como marco del sitio, la status line fija en la ventana, el gutter de números de línea en las secciones, la mono en los titulares y los datos como YAML. Todo eso convierte el trabajo en un juego.
- **De C:** el monocromo puro (pierde la calidez), quitar todas las cards (los proyectos son objetos y merecen un contenedor) y reducir el panel del build a una línea.
- **Fuera de las tres:** un selector de tema (`:set background=light` sería divertido, pero agrega JS, un parpadeo del tema al cargar y un estado que hoy resuelve `prefers-color-scheme`), una tercera familia tipográfica (no cabe en el presupuesto), el grain/noise (pintura cara en mobile y contraste más difícil de garantizar) y la ilustración generada de un setup.

### 5.4 Cómo se ve

Los bocetos son ilustrativos: muestran la composición, no el texto ni las medidas finales.

**Hero (desktop, `lg+`):**

```text
┌────────────────────────────────────────────────────────────────────┐
│ DENIS SIAVICHAY · SOFTWARE ENGINEER          ░░░ glow ámbar ░░░     │
│                                         ┌──────────────────────────┐│
│ I build the software                    │ ● ● ●   ~/dbsiavichay.dev ││
│ a business runs on.                     ├──────────────────────────┤│
│                                         │ $ build-info              ││
│ Quoting, inventory, invoicing,          │ ┌────┐ commit    fc2cafe  ││
│ production — modeled from the           │ │ DS │ built     2026-10-…││
│ domain up and shipped with…             │ └────┘ toolchain Next.js …││
│                                         │        rendering prerend…  ││
│ [ See the work → ]  [ Get in touch ]    │        languages en · es   ││
│                                         │        source    github.c…││
│ ⌖ Based in Ecuador · remote, UTC−5      │        ■ ■ ■ ■ ■ ■ ■ ■     ││
│                                         │ $ ▍                        ││
│                                         ├──────────────────────────┤│
│                                         │ ● static   How it's built →││
│                                         └──────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

- El copy no cambia. El H1 sigue siendo el LCP y no se anima.
- La terminal escribe `build-info` una vez (CSS `steps()`, ~0,6 s), la salida entra con `rise` escalonado y el cursor parpadea 5 veces y se queda fijo.
- El keycap "DS" a la izquierda de la salida es el "logo" del neofetch, y la fila de cuadros muestra la paleta del sitio (los tokens, como el bloque de colores de neofetch).
- Glow: un `radial-gradient` del acento a ~8% detrás de la ventana, solo en dark y solo en `lg+`. Es el único gradiente del sitio y relaja a propósito la regla "sin gradientes" del §10 del plan.
- El grid de dibujo sigue, pero se desvanece hacia los bordes con `mask-image`.

**Hero (mobile):** el texto y los CTAs primero; la terminal debajo, a todo el ancho, sin el keycap ni el glow, con la misma información.

**Tarjeta de proyecto:**

```text
┌───────────────────────────────────────────────────────┐
│ ~/projects/maderable                   Client · 2025– │
├───────────────────────────────────────────────────────┤
│ Maderable                                             │
│ Quoting, cut optimization and production…             │
│ …                                                     │
│ FastAPI · PostgreSQL · OR-Tools CP-SAT · Rust · …     │
│                                          Case study ↗ │
└───────────────────────────────────────────────────────┘
```

La ruta es la ruta real del contenido en el repo (`src/content/projects/maderable/`). Es una pestaña de editor, no una terminal: sin puntos de ventana ni prompt.

**Case study:**

```text
← Selected work
~/projects/maderable   CASE STUDY — CLIENT — N MIN READ
Maderable
…
01 / The shop                              ON THIS PAGE
…                                          │ 01 The shop
02 / The problem was the price…            ▌ 02 The problem was…
…                                          │ 03 The constraints…
                                           NORMAL · 02/08
```

**Experiencia:**

```text
●  2025 – present      Software Engineer · Independent
│
●  11/2024 – present   Senior Fullstack Engineer · Konfio
│
○  10/2021 – 10/2024   Software Engineer · Jüsto
│
○  09/2019 – 09/2021   Software Developer · team lead · Municipality of Morona
```

---

## 6. Plan de implementación concreto

### 6.1 Por área

| Área                   | Cambios                                                                                                                                                                                                                                                                                                                                        | Fase  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **Colors**             | Paleta P1 en `globals.css` (dark y light); tokens nuevos: `--term-*` (fijos oscuros), `--syn-*`, `--glow`, `--keycap-*`. `themeColor` del layout, imágenes OG y favicon actualizados, leídos de `src/lib/theme-colors.ts`. Contraste verificado por un test que lee `globals.css` (D37).                                                       | 10    |
| **Typography**         | Geist Sans + Geist Mono (sin fuentes nuevas). `@utility path-mono` (en su propia caja, sin tracking) junto a `label-mono`. Display con más aire (interlineado 1.05, tracking −0.03em) y `text-lede` (18 → 20 px) bajo cada título display. El índice de sección pasa de `01 —— EYEBROW` a `01 / EYEBROW`. Escala revisada en `/design-system`. | 10    |
| **Navbar**             | El monograma "DS" como keycap (se hunde al pulsar). La pista ⌘K con el `Kbd` keycap. Los links, la estructura y el menú móvil no cambian.                                                                                                                                                                                                      | 11    |
| **Hero**               | Composición nueva alrededor de la terminal; glow; grid con `mask-image`; mobile apilado. El copy y los CTAs no cambian.                                                                                                                                                                                                                        | 11    |
| **Terminal**           | `components/terminal/terminal-window.tsx` (Server Component): barra de título, cuerpo y status bar. `SystemStatus` la usa con la salida estilo neofetch. Sigue siendo una `section` "This build" con un `dl`; los comandos van `aria-hidden` y los `dt` siguen siendo legibles.                                                                | 11    |
| **Projects**           | Cabecera de ruta en las tres tarjetas; stack como texto mono separado por `·`; open source con `pip install <paquete>`. El plano de corte se queda.                                                                                                                                                                                            | 12    |
| **Case studies**       | Ruta en el eyebrow; h2 numerados con un contador CSS de texto alternativo vacío (`content: "01 / " / ""`), sin tocar ids ni el TOC; bloques de código con estilo de editor; TOC con cursorline (`aria-current="location"`) y mini status line, en una isla de ~1 KB que solo existe en artículos.                                              | 12    |
| **Experience**         | Riel tipo `git log --graph`: un punto por entrada (lleno si sigue vigente), fechas mono. Sigue siendo `<ol>`.                                                                                                                                                                                                                                  | 12    |
| **About**              | Figura del workspace: un dibujo SVG de un teclado 75% en planta (mismo lenguaje que el plano de corte, Esc en ámbar) con una ficha breve del setup. Si `profile.workspace.photo` existe, se muestra la foto en su lugar. Capacidades, proceso y stack pierden cajas donde no significan nada.                                                  | 12    |
| **Animations**         | Typing de `build-info` (una vez), cursor (5 parpadeos), keycaps que se hunden (`:active`), cursorline del TOC. Todo CSS salvo el seguimiento del TOC. Nada infinito, nada que flote.                                                                                                                                                           | 11–13 |
| **Micro-interactions** | Atajos y modo comando (6.3), ayuda `?` con keycaps e interruptor, easter eggs (6.4).                                                                                                                                                                                                                                                           | 13    |
| **Images**             | Ninguna imagen nueva en el camino crítico. La futura foto del setup: `<picture>` AVIF + WebP, 2 anchos, `loading="lazy"`, `width`/`height` explícitos y codificada de antemano, como el retrato (D34). Sin preload: está bajo el pliegue.                                                                                                      | 12    |
| **Mobile**             | La terminal sin logo ni glow; las pistas de teclado se ocultan en dispositivos táctiles (`@media (hover: none)`); el dibujo del teclado se escala y sus rótulos se ocultan bajo `sm` (como en el plano de corte); la status line del TOC solo existe en `lg+`. Se revisa en 320–1920 px.                                                       | 14    |

### 6.2 Fases

Cada fase: rama `portfolio/fase-N-<nombre>` desde `master` actualizado, un commit, pausa para revisión. Denis hace push y merge, y cada merge a `master` despliega.

| Fase                                             | Pasos del brief                            | Archivos principales                                                                                                                                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9. Propuesta                                     | —                                          | Este documento y `PORTFOLIO_PLAN.md` §20.                                                                                                                                                                                                                    |
| 10. Fundamentos                                  | 1 tokens · 2 tipografía · 3 color          | `src/app/globals.css`, `src/lib/og-image.tsx`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/design-system/page.tsx`.                                                                                                                                         |
| 11. Navbar, hero y terminal                      | 4 navbar · 5 hero · 8 terminal             | `ui/kbd.tsx`, `navigation/navbar.tsx`, `terminal/terminal-window.tsx` (nuevo), `home/system-status.tsx`, `home/hero.tsx`, diccionarios.                                                                                                                      |
| 12. Proyectos, case studies, experiencia y About | 6 project cards · 7 case studies           | `home/project-card.tsx`, `home/featured-work.tsx`, `article/article-header.tsx`, `article/table-of-contents.tsx` (+ isla de seguimiento), `globals.css` (prose), `home/experience.tsx`, `home/about.tsx` (+ figura y dibujo del teclado), `data/profile.ts`. |
| 13. Micro-interacciones                          | 9 micro-interactions                       | `command/shortcuts.ts` (nuevo, lógica pura), `command/command-menu.tsx`, `command/command-palette.tsx`, `command/commands.ts`, `command/shortcuts-help.tsx` (nuevo, lazy), `navigation/footer.tsx`, `not-found.tsx`, colophon.                               |
| 14. Responsive, performance y pulido             | 10 responsive · 11 performance · 12 polish | Revisión de screenshots, Lighthouse, ajustes y la revisión final de la sección 8.                                                                                                                                                                            |

El paso 8 (terminal) se adelanta a la fase 11 porque la terminal _es_ el hero; en la fase 13 solo recibe interacción (el modo comando de ⌘K).

### 6.3 Atajos de teclado

| Tecla       | Acción                                               | Se puede apagar |
| ----------- | ---------------------------------------------------- | --------------- |
| ⌘K / Ctrl K | Buscar (ya existe)                                   | No              |
| `/`         | Buscar                                               | Sí              |
| `:`         | Abre ⌘K en modo comando                              | Sí              |
| `?`         | Ayuda de atajos                                      | Sí              |
| `g` `h`     | Inicio                                               | Sí              |
| `g` `p`     | Proyectos (`#work`)                                  | Sí              |
| `g` `n`     | Notas                                                | Sí              |
| `g` `e`     | Experiencia                                          | Sí              |
| `g` `a`     | Sobre mí                                             | Sí              |
| `g` `c`     | Contacto                                             | Sí              |
| `j` / `k`   | Sección siguiente / anterior (home) o h2 (artículos) | Sí              |
| Esc         | Cierra el diálogo abierto (nativo)                   | No              |

Reglas:

- **Encendidos por defecto**, con un interruptor en la ayuda que se guarda en `localStorage` (con `try/catch`: si el navegador lo bloquea, quedan encendidos solo en esa visita). Cumple WCAG 2.1.4.
- La ayuda también se abre sin atajos: con un botón en el footer y con una acción de ⌘K. Así, quien los apagó puede volver a encenderlos.
- **Nunca se disparan** dentro de `input`, `textarea`, `select` o `contenteditable`; con Ctrl, ⌘ o Alt; durante una composición IME; ni con un diálogo abierto.
- La secuencia `g` + tecla expira en 1 s.
- Ningún atajo es la única forma de llegar a algo: todo sigue en el nav, en los links y en ⌘K.
- Se documentan en la ayuda `?` y en el colophon. Los easter eggs no.
- El código va en la isla de ⌘K que ya existe (+1–2 KB); la ayuda se carga en su primer uso, con el mismo patrón `lazy` + `preload` del diálogo de ⌘K.

**Modo comando** (⌘K con `:` al principio): `:help`, `:projects` (alias `:work`), `:notes`, `:experience`, `:about`, `:contact`, `:colophon`, `:lang`, `:q`, `:q!`, `:wq`. Un comando desconocido responde como Vim: `E492: Not an editor command: …`, con la pista `:help`.

### 6.4 Easter eggs

Sutiles, sin bloquear nada y sin convertir la página en un juego:

- `sudo hire denis` en ⌘K: _"Permission granted. Let's talk."_ / _"Permiso concedido. Hablemos."_, y lleva a Contacto.
- `:q` o `:wq`: cierra ⌘K con _"Closed. This one you can quit."_ / _"Cerrado. De este sí se puede salir."_
- Un comando desconocido: `E492: Not an editor command`.
- La 404: `cd: no such file or directory: /en/…` en mono, sobre el copy humano, que no cambia.
- Un `console.info` con un saludo, el link al repositorio y la pista `?`.

---

## 7. Hechos del setup y copy a confirmar

Confirmado por Denis el 2026-10-03:

- **Tiene un Keychron K2 (75%) con switches brown.** La marca y el modelo aparecen como datos en la ficha del setup, nunca como logo ni como protagonista.
- **Usa Vim de forma ocasional, y le gusta.** El copy nunca dice "a diario", "vivo en Vim" ni "muscle memory".
- **No hay foto del setup por ahora.** El dibujo del teclado es la figura; la foto entra cuando exista.

Borradores, aprobados por Denis el 2026-10-03. La ficha dice "Keychron K2" y "Brown"; la mitad de la frase de About que habla de Vim entra en la fase 13, con los atajos, para no afirmar algo que todavía no es cierto:

| Dónde                   | EN                                                                                                                          | ES                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pie del dibujo          | The keyboard, drawn like a cut plan.                                                                                        | El teclado, dibujado como un plano de corte.                                                                                    |
| Ficha del setup         | Keyboard: Keychron (`pending`: model, switches)                                                                             | Teclado: Keychron (`pending`: modelo, switches)                                                                                 |
| Frase opcional en About | Away from the work itself: mechanical keyboards. Vim keys work on this site because I like them, not because I live in Vim. | Fuera del trabajo en sí: teclados mecánicos. Los atajos de Vim funcionan en este sitio porque me gustan, no porque viva en Vim. |
| Ayuda de atajos         | Vim-style keys, because I like them. Turn them off if they get in the way.                                                  | Atajos al estilo de Vim, porque me gustan. Apágalos si te estorban.                                                             |

Concepto del asset generado (aprobado e implementado en la fase 12):

- **Dibujo de un teclado 75% en planta**, generado como SVG en el servidor a partir de un arreglo de filas y anchos de tecla (en unidades `u`), igual que el plano de corte deriva su geometría de sus datos.
- Hairlines `non-scaling-stroke` en `line-strong`, teclas como piezas sobre una placa (el espacio entre teclas hace de kerf), Esc en ámbar, una cota encima y rótulos mono (`esc`, `75 %`).
- Sin logo ni marca. Unos 3–5 KB inline, decorativo (`aria-hidden`) y con `figcaption`.
- Sigue al tema claro y oscuro.

---

## 8. Revisión final (se responde al cerrar la fase 14)

| Pregunta                                                     | Cómo se verifica                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| ¿Se reconoce que es el portfolio de un Software Engineer?    | El H1, los proyectos y la evidencia siguen primero; la terminal está al lado, no encima.                                |
| ¿Tiene una identidad visual propia?                          | La terminal con datos reales, el teclado dibujado como un plano de corte y el lenguaje compartido de hairlines y ámbar. |
| ¿Se siente diferente de una plantilla?                       | Comparación de screenshots antes y después, sección por sección.                                                        |
| ¿La estética del setup está integrada naturalmente?          | Cada elemento cuenta algo verdadero o hace algo útil (sección 3).                                                       |
| ¿La terminal aporta algo?                                    | Muestra el build real; si se quita, se pierde información.                                                              |
| ¿Vim aporta personalidad sin ser gimmick?                    | Atajos opcionales, documentados, con interruptor; un modo comando que funciona.                                         |
| ¿El teclado mecánico aporta identidad sin dominar el diseño? | Aparece en keycaps y en una figura de About; nunca en el hero.                                                          |
| ¿Los proyectos siguen siendo protagonistas?                  | Orden de la home intacto (test e2e); `#work` sigue siendo la primera sección grande.                                    |
| ¿La experiencia sigue siendo profesional?                    | El copy no cambia; los easter eggs solo aparecen a quien los busca.                                                     |
| ¿Funciona perfectamente en mobile?                           | Tests sin overflow en 8 anchos y revisión de los screenshots.                                                           |
| ¿La página sigue siendo rápida?                              | Lighthouse CI: Performance ≥ 95, JS ≤ 150 KB en la home, fuentes ≤ 70 KB.                                               |
| ¿La accesibilidad se mantiene?                               | axe sin violaciones, foco visible, reduced motion, WCAG 2.1.4 y 2.2.2, contraste por script.                            |

Si alguna respuesta es "no", la fase 14 no se cierra hasta corregirla.

### 8.1 Respuestas (2026-10-03, cierre de la fase 14)

Todas las respuestas son "sí". Las capturas de comparación son de la fase 8 (`fc2cafe`, antes de esta etapa) contra la rama de las fases 13–14, a 1440 px, sección por sección; la revisión de mobile usa 320, 390 (Pixel 7), 768, 1024, 1920 y un iPad horizontal.

1. **¿Se reconoce que es el portfolio de un Software Engineer?** Sí. El H1, la bajada y los CTAs no cambiaron y siguen siendo lo primero que se lee. La terminal está al lado desde `lg` y debajo en mobile, nunca encima.
2. **¿Tiene una identidad visual propia?** Sí. La terminal muestra el build real; el teclado está dibujado con el lenguaje del plano de corte (hairlines, cotas, Esc en ámbar); los keycaps del monograma, de ⌘K, de la ayuda y del footer se hunden al pulsarlos; la mono escribe rutas, comandos y teclas.
3. **¿Se siente diferente de una plantilla?** Sí. Contra la fase 8: el hero pasó de una tarjeta genérica a una ventana de terminal con salida tipo neofetch y la luz de la lámpara; capacidades dejó cuatro cajas por columnas con hairline; las tarjetas tienen la ruta `~/projects/<slug>` y el stack en una línea; `01 —— EYEBROW` es `01 / EYEBROW`; la experiencia es un riel `git log --graph`; los case studies numeran sus h2 y siguen la sección con cursorline y `NORMAL 03/08`; About tiene la figura del workspace; la 404 responde como una shell. Los siete problemas de la sección 2 tienen una respuesta visible.
4. **¿La estética del setup está integrada naturalmente?** Sí. Cada elemento es verdadero o útil: la terminal lee el build; las rutas son las del contenido en el repositorio; `pip install` instala el paquete; el riel marca qué empleo sigue vigente; el teclado es el K2 de Denis; los atajos funcionan; la frase de Vim dice lo que Denis confirmó (lo usa de forma ocasional y le gusta).
5. **¿La terminal aporta algo?** Sí. Es el panel "This build": commit, fecha, toolchain y fuente salen del build, y un test e2e los fija. Sin ella se pierde esa información y el acceso al colophon. La 404 la usa para la respuesta de la shell, con la ruta que se pidió.
6. **¿Vim aporta personalidad sin ser gimmick?** Sí. Los atajos se pueden apagar (WCAG 2.1.4), están documentados en `?` y en el colophon, nunca se disparan al escribir, y nada se alcanza solo con ellos. El modo comando funciona (`:projects`, `:lang`…) y responde E492 como Vim. Los easter eggs (`sudo hire denis`, `:q`) solo aparecen a quien los escribe.
7. **¿El teclado mecánico aporta identidad sin dominar el diseño?** Sí. Aparece en keycaps pequeños y en una figura de About, sin logo ni marca; nunca en el hero.
8. **¿Los proyectos siguen siendo protagonistas?** Sí. El orden de la home no cambió (el e2e fija los h2 de `main section[id]`), `#work` tiene sus 4 `article` y la tarjeta de Maderable conserva el plano de corte.
9. **¿La experiencia sigue siendo profesional?** Sí. El copy no cambió, salvo la frase del workspace en About, aprobada por Denis (sección 7). Los easter eggs no se anuncian y el saludo vive en la consola.
10. **¿Funciona perfectamente en mobile?** Sí. Los tests sin overflow pasan en los 8 anchos, de 320 a 1920 px. En las capturas: la terminal va sin logo ni glow en mobile; las pistas de teclado y el botón de la ayuda no se muestran en pantallas táctiles (`hover: none`); el dibujo del teclado pierde los rótulos bajo `sm`; la status line del TOC solo existe desde `lg`; una ruta larga en la 404 se corta sin desbordar.
11. **¿La página sigue siendo rápida?** Sí. Lighthouse CI con perfil de teléfono, tres corridas por URL: performance de 96 a 99, y 100 en accesibilidad, buenas prácticas y SEO. JS en la home: 145,4 de 150 KiB (144,2 al cerrar la fase 12; los atajos sumaron 1,2 KiB a la isla de ⌘K). Case study: 156,3 de 165 KiB. Fuentes: 62,9 de 70 KiB.
12. **¿La accesibilidad se mantiene?** Sí. axe no encuentra violaciones en las ocho rutas del test, en desktop y mobile, ni con ⌘K o la ayuda abiertos. El foco es visible, `j`/`k` respetan el movimiento reducido, el cursor parpadea cinco veces (WCAG 2.2.2), los atajos se pueden apagar (WCAG 2.1.4) y el contraste de los tokens lo verifica un test.

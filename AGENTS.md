<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

`PORTFOLIO_PLAN.md` is the source of truth for scope, decisions and pending facts.

## Content

- Never invent facts: companies, roles, dates, metrics, clients, technologies or years of experience. Anything unconfirmed uses `pending("what needs confirming")` from `src/lib/pending.ts` (or the literal marker `TODO: CONFIRM WITH DENIS` in prose). Pending facts render as a badge in development and are omitted in production; `npm run content:pending` lists them.
- Maderable is a client: its name and architecture may be published; figures and benchmarks may not, nor the shop's customers or the commercial name of its existing systems.
- Grazia's salon is never named.
- Every interface string lives in both `src/i18n/dictionaries/en.ts` and `es.ts` (Spanish is neutral, `tú`). Structured content in `src/data` writes its text as `Localized<T>` (both languages required by type). Long-form content has an `en.mdx` and an `es.mdx`.
- Claims point to their evidence (`project(slug)`, `job(id)`, `thisSite` from `src/data/evidence.ts`); tests reject references to anything that doesn't exist or isn't confirmed.

## Code

- Server Components by default; a Client Component only where there is real interactivity.
- Colours come from the tokens in `src/app/globals.css` (Tailwind's default palette is disabled on purpose).
- `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` must pass with no warnings. `npm run test:e2e` and `npm run lhci` run against the standalone build, so build first.

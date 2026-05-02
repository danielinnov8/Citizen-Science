# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **`artifacts/api-server`** — Express 5 API server (currently only health check; unused by the citizen-science prototype).
- **`artifacts/mockup-sandbox`** — Component preview sandbox used during early design iteration on the canvas.
- **`artifacts/citizen-science`** — Citizen Science web app (React + Vite + TypeScript + Tailwind v4 + wouter). Premium minimalist science learning prototype with no backend or auth — mock auth and data persistence are handled in `localStorage` via `src/lib/auth.tsx` and `src/lib/storage.ts`. Routes: `/`, `/login`, `/onboarding`, `/dashboard`, `/categories`, `/category/:slug`, `/experiments`, `/experiments/:id`, `/notebook`, `/progress`, `/profile`. Public routes are `/` and `/login`; everything else is gated by `ProtectedRoute`. 14 science categories live in `src/lib/categories.ts`, starter experiments in `src/lib/experiments.ts`. Brand palette in `src/index.css`: bg `#F8FAFC`, text `#0F172A`, blue `#2563EB`, green `#16A34A`, violet `#7C3AED`. Inter for sans, Instrument Serif for hero headlines.

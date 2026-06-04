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

- **`artifacts/api-server`** — Express 5 API server. Auth routes under `/api/auth`: `POST /register`, `POST /login`, `POST /logout`, `GET /me`, plus Google OAuth `GET /google` (start, PKCE + state in signed cookies) and `GET /google/callback` (create-or-link user by email, set session cookie, redirect to `/login`). Sessions use a `cs_session` httpOnly signed cookie (30-day TTL); passwords are scrypt-hashed (`scrypt$salt$hash`, no external deps) in `src/lib/auth/`. `requireAuth` middleware (in `src/middlewares/`) gates the agent routes and `/me`. `app.ts` sets `trust proxy` and uses `cookie-parser` with `SESSION_SECRET`. Google OAuth uses the user's OWN `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` secrets (not a Replit connector); redirect_uri is derived from `REPLIT_DOMAINS` as `https://<domain>/api/auth/google/callback` — register both dev and prod callback URLs in Google Cloud Console. Other routes: `/api/healthz`, `POST /api/agent/chat` (SSE streaming, OpenAI-backed science copilot), and `POST /api/agent/process-observation` (Gemini-backed field-notes analyzer). The chat route uses `@workspace/integrations-openai-ai-server` (OpenAI via Replit AI proxy, model `gpt-5.4`). The process-observation route uses `@workspace/integrations-gemini-ai-server`, which wraps `@google/genai` (model `gemini-2.5-flash` with a `responseSchema`) using the user's own `GEMINI_API_KEY` secret (not Replit's managed Gemini integration — the user explicitly chose their own key); it validates a non-empty `rawText` body and returns `{ success, data }` structured JSON (summary, category, observations, tags, location, measurements, observedAt, species). Both agent routes are gated by the `requireAuth` middleware (valid `cs_session` cookie required). Stream cancellation on the chat route listens on `res.on("close")` (not `req`) and aborts the upstream OpenAI request when the client disconnects. Note: `build.mjs` externalizes `@google/*`, so `@google/genai` is declared as a direct dependency of api-server (not just the lib) to resolve at runtime.
- **`artifacts/mockup-sandbox`** — Component preview sandbox used during early design iteration on the canvas.
- **`artifacts/citizen-science`** — Citizen Science web app (React + Vite + TypeScript + Tailwind v4 + wouter). Premium minimalist science learning prototype. Auth is now real and backend-backed (Postgres + Drizzle via api-server): `src/lib/auth.tsx` is a context wrapping the generated `useGetCurrentUser`/`useLogin`/`useRegister`/`useLogout` hooks (session cookie `cs_session` sent same-origin). `/login` offers email+password (register toggle) and "Continue with Google" (`window.location.href = "/api/auth/google"`); the Google callback redirects back to `/login` with `?error=google` / `?error=google_unconfigured` on failure. `ProtectedRoute` shows a loading state while `useGetCurrentUser` resolves, redirects to `/login` if unauthenticated, and to `/onboarding` if not yet onboarded. Onboarding completion is still a `localStorage` flag (`cs_onboarded`); other app data persists in `localStorage` via `src/lib/storage.ts`. The old fake `cs_auth` localStorage flag and `x-cs-auth` header are gone. Routes: `/`, `/login`, `/onboarding`, `/dashboard`, `/agent`, `/categories`, `/category/:slug`, `/experiments`, `/experiments/:id`, `/notebook`, `/progress`, `/profile`. The `/agent` route is the science copilot chat: the landing-page input writes the user's prompt to `localStorage.cs.pendingPrompt` and routes to `/login` (or directly to `/agent` if already authed). Login and onboarding both forward to `/agent` when a pending prompt exists. `Agent.tsx` auto-sends the pending prompt on mount, streams SSE replies from `POST /api/agent/chat`, and renders inline `[[module:slug]]` tokens as clickable category cards. Conversation history persists at `localStorage.cs.agentConversation`. Public routes are `/` and `/login`; everything else is gated by `ProtectedRoute`. 14 science categories live in `src/lib/categories.ts`, starter experiments in `src/lib/experiments.ts`. Brand palette in `src/index.css`: bg `#F8FAFC`, text `#0F172A`, blue `#2563EB`, green `#16A34A`, violet `#7C3AED`. Inter for sans, Instrument Serif for hero headlines.

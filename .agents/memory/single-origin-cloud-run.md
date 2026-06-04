---
name: Single-origin Cloud Run (frontend + API)
description: Why and how the Cloud Run image serves both the SPA and the Express API from one origin, plus the build-time gotchas.
---

# Single-origin Cloud Run deploy (Path A)

The Citizen Science API + web client are served from ONE Cloud Run service /
origin: Express serves `/api/*`, then static SPA files, then an SPA fallback for
non-`/api` GET/HEAD routes.

**Why:** auth uses a session cookie (`cs_session`, `SameSite=Lax`). Pointing the
Replit-hosted frontend at the Cloud Run API would make the cookie *cross-site*
(`replit.app` ↔ `run.app`) — a third-party cookie that Safari/Firefox block and
Chrome is deprecating, so login would silently fail for many users. Same-origin
keeps `SameSite=Lax` working everywhere with no CORS/bearer-token complexity.
The user explicitly chose this (Path A) over bearer tokens or `SameSite=None`.

**How to apply:**
- The static block in `app.ts` is gated on `existsSync(clientDir)` where
  `clientDir = <dir of bundled index.mjs>/public`. It is absent in Replit
  dev/prod (frontend served separately), so the block no-ops there — never
  remove the gate or it will interfere with the Replit split setup.
- Dockerfile builds the Vite client and copies `dist/public` to
  `/app/dist/public`, next to the server bundle.
- `vite.config.ts` validates `PORT` and `BASE_PATH` at config-load time even for
  `vite build`, so the Docker build must pass `PORT=3000 BASE_PATH=/`. `BASE_PATH=/`
  serves the SPA at the domain root; relative `/api` calls then stay same-origin.

**OAuth on non-Replit hosts:** `getRedirectUri(req)` derives the Google callback
URL from `PUBLIC_BASE_URL` → `REPLIT_DOMAINS` → request host (in that order),
because `REPLIT_DOMAINS` does not exist on Cloud Run. Set `PUBLIC_BASE_URL` to
the exact Cloud Run origin and register that callback in the Google console.

**Cloud Run prerequisites (the app crashes/!works without them):** `DATABASE_URL`
(the DB lib throws at import if missing — a real Postgres must be provisioned and
migrated), `SESSION_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, and `PUBLIC_BASE_URL`.

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

**DB connection is lazy (don't revert this):** `lib/db/src/index.ts` exports `db`
and `pool` as Proxies that create the pg Pool + drizzle instance on FIRST USE,
not at import. **Why:** the original eager `throw` on missing `DATABASE_URL`
crash-looped the whole Cloud Run container at boot (revision "failed to start and
listen on PORT"), which also took down the bundled frontend. Lazy init lets the
container boot and serve the SPA + `/healthz` even before the DB is wired; DB
routes fail per-request instead. The Proxy binds methods to the real instance —
drizzle/pg use private fields that are unreachable if `this` is the Proxy, so
never drop the `.bind(target)`.

**Three separate databases — do not conflate them (cost a wrong diagnosis once):**
- Replit DEV `DATABASE_URL` = Replit-managed Postgres (host suffix `helium`).
- Replit "production" via `executeSql({environment:"production"})` = Replit's
  managed prod replica. **This is NOT what Cloud Run uses.**
- Cloud Run PROD = the user's own **Neon** Postgres, set as `DATABASE_URL` in the
  Cloud Run Variables & Secrets panel. The agent has no access to it from Replit.
- Consequence: querying Replit's "production" tells you nothing about Neon. To
  inspect/repair real prod you must connect with the Neon connection string.

**Neon schema now auto-migrates at API boot** (see `neon-migrate-on-boot.md`).
The Cloud Run *build* still never touches the DB; the running container applies
committed versioned drizzle migrations on startup against its `DATABASE_URL`
(= Neon). Replit Publish's schema-diff flow still does NOT apply. To change the
schema: `pnpm --filter @workspace/db run generate`, commit the SQL, deploy.

**Data self-heals via seed-on-boot, schema does not.** `seedFeaturedProfiles`
runs at app boot against whatever `DATABASE_URL` Cloud Run has (= Neon): if the
table is empty it bulk-inserts the committed snapshot. So once Neon's schema has
the columns, the next deploy/restart auto-populates the 49 profiles — only the
one-time schema migration is manual.

**Cloud Run env vars (app boots without them now, but features need them):**
Replit Secrets do NOT propagate to the user's own Cloud Run service — they must
be set in the Cloud Run "Variables & Secrets" panel (runtime, not Docker build
args; the build only needs `PORT`+`BASE_PATH`). Deploy is GitHub-sync → fresh
Cloud Run build, NOT Replit Publish.
- `DATABASE_URL` (a real Postgres must still be provisioned + migrated for login),
  `SESSION_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `PUBLIC_BASE_URL`.
- `STRIPE_SECRET_KEY` — REQUIRED for any Stripe feature on Cloud Run. The
  Replit Stripe **connector is unreachable on Cloud Run** (needs
  `REPLIT_CONNECTORS_HOSTNAME` + `REPL_IDENTITY`/`WEB_REPL_RENEWAL`, none of which
  exist there), so `getStripeCredentials()` now prefers `STRIPE_SECRET_KEY` from
  env and only falls back to the connector in Replit dev — same precedent as the
  AI-proxy/GEMINI fix. Use the **test-mode** key (`sk_test_…`) to verify with card
  4242 (no real money). `STRIPE_WEBHOOK_SECRET` is OPTIONAL: `initStripe`
  auto-registers a managed webhook (built off `PUBLIC_BASE_URL`, not
  `REPLIT_DOMAINS`) and stores its signing secret in `stripe."_managed_webhooks"`.
  Symptom of the missing key: `/api/billing/prices` returns empty arrays, checkout
  503s, no products backfill — because `initStripe` step 2 (`getStripeSync`) throws.
- `D_ID_API_KEY` — required for the "Talk to Albert" live avatar. A missing key
  is the cause of the in-app "live avatar isn't configured yet" message.
- `YOUTUBE_API_KEY` — required for the copilot's verified-video cards.
- `PUBLIC_BASE_URL` is doubly important for the avatar: D-ID downloads the
  self-hosted portrait from a URL built off `PUBLIC_BASE_URL`, so a wrong/missing
  value breaks the avatar even when `D_ID_API_KEY` is valid.

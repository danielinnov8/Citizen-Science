---
name: Stripe connector credential field
description: Quirks when wiring the Replit Stripe connector to stripe-replit-sync in this monorepo.
---

## Rules

1. **Credential field is `secret`, not `secret_key`.**  
   The Replit connector API (`/api/v2/connection?include_secrets=true&connector_names=stripe`) returns `settings.secret` and `settings.publishable`. Any `stripeClient.ts` that reads `settings.secret_key` will get `undefined` and throw "Stripe integration not connected".

2. **`runMigrations` has no `schema` param.**  
   `stripe-replit-sync`'s `runMigrations({ databaseUrl })` hardcodes `schema = "stripe"` internally. Passing `{ databaseUrl, schema: "stripe" }` causes a TS error (`schema` not in `MigrationConfig`).

3. **`db.execute(sql\`...\`)` returns `QueryResult`, not an array.**  
   Drizzle's `db.execute` returns `{ rows: [...] }`. The billing prices route must extract `.rows`:  
   ```ts
   const result = await db.execute(sql`...`);
   const rows = (result as any).rows ?? (result as any);
   ```

4. **`syncBackfill()` without args uses event-type list as `object`, not "all".**  
   Always pass `{ object: "all" }` explicitly: `stripeSync.syncBackfill({ object: "all" })`.

5. **`api-zod/src/index.ts` must use `export type *` for types.**  
   Orval generates Zod const wrappers named after operationIds (e.g. `CreateCheckoutSessionResponse`). If an OpenAPI schema has the same name, `export * from "./generated/api"` conflicts with `export * from "./generated/types"`. Fix: `export type * from "./generated/types"` — or rename the OpenAPI schema to avoid the collision (e.g. `CheckoutUrl` instead of `CreateCheckoutSessionResponse`).

6. **`stripe-replit-sync` MUST be in the esbuild `external[]` list (`artifacts/api-server/build.mjs`).**  
   Its `runMigrations()` finds its SQL via `path.resolve(dirname(fileURLToPath(import.meta.url)), "./migrations")`. If esbuild *bundles* it into `dist/index.mjs`, `import.meta.url` points at the bundle, so it looks for `/app/dist/migrations` (absent). `connectAndMigrate` then does `if (!fs.existsSync(dir)) return;` — a **silent no-op, no throw** — after only running `CREATE SCHEMA IF NOT EXISTS stripe`. Net result: an EMPTY `stripe` schema, "Stripe schema ready" logs, then boot throws `relation "stripe.accounts" does not exist` inside `findOrCreateManagedWebhook` → caught → "Stripe init skipped" → empty `/billing/prices` on the live site even with a valid key + live products. Fix = externalize it (same reason `@google/*` is external: path-traversal file reads); both `stripe` and `stripe-replit-sync` are direct api-server deps so `pnpm deploy --prod` ships them to `node_modules` where `./migrations` resolves. Self-heals on the next boot — the empty schema is harmless (`CREATE SCHEMA IF NOT EXISTS` no-ops; `_migrations` is absent so the destructive "drop empty schema" branch is skipped; migrations then apply normally).

**Why:** These are all silent mismatches between the Replit connector API response shape and what the stripe-replit-sync template assumes.

**How to apply:** Any time the Stripe integration is re-wired (new Repl, Cloud Run deploy, fresh checkout), verify these 5 points before debugging why products/prices aren't showing up.

## Publishing Stripe to the live site (self-managed Cloud Run, NOT Replit)

**CRITICAL topology gotcha:** the LIVE site (`citizen-science.org`) is the user's OWN Google Cloud Run service, built from the repo-root `Dockerfile` (deploy via GitHub→Cloud Build). It is **separate** from the Replit Autoscale deployment (`citizenscience.replit.app`, which `getDeploymentInfo` reports as `primaryUrl` with no custom domains and is stale/unused). Confirm with `getDeploymentInfo` (primaryUrl + empty `additionalUrls`) and by cur`l`-ing both hosts. Consequence: **secrets/env vars set in Replit (workspace secrets OR production-scoped env vars) do NOT reach the live site.** The Dockerfile comment says it plainly — env like `GEMINI_API_KEY` is set in the **Cloud Run "Variables & Secrets" panel**. Don't waste a cycle setting a Replit secret + `suggestDeploy` for a live-site env problem; that only redeploys the unused Replit copy.

Symptom: dev `/pricing` works but the live site shows top-ups greyed "Coming soon" and subscription/founding buttons silently do nothing. Cause: `citizen-science.org/api/billing/prices` returns empty (route works, catalog empty), so the frontend never gets price IDs. The frontend is correct — do NOT rewrite it.

Root cause: Cloud Run can't reach the Replit Stripe connector. `getStripeCredentials()` is env-first: it needs `STRIPE_SECRET_KEY` in the environment, else falls back to the connector (Replit-only). With no key on Cloud Run, boot `initStripe()` throws→catches→"Stripe init skipped" → no catalog synced → empty `/billing/prices`.

Fix (no code change): in the **Cloud Run console** for the live service → Edit & Deploy New Revision → Variables & Secrets → add `STRIPE_SECRET_KEY` (same panel as `GEMINI_API_KEY`), confirm `PUBLIC_BASE_URL=https://citizen-science.org` is present, then Deploy. On boot the new revision migrates the stripe schema → `findOrCreateManagedWebhook(${PUBLIC_BASE_URL}/api/stripe/webhook)` → `syncBackfill({object:"all"})` pulls the catalog.

**Why:** mirrors the Gemini "own API key on Cloud Run" pattern — Replit connectors are unreachable off-Replit, and a self-managed Cloud Run reads only its own env.

**How to apply:**
- `PUBLIC_BASE_URL` must be set on Cloud Run: both checkout success/cancel URLs (`routes/billing.ts`) and the webhook registration (`index.ts`) derive the domain from it (REPLIT_DOMAINS fallback is empty on Cloud Run). Missing it = malformed success_url + no webhook registered = credits never granted after purchase.
- Use the same Stripe **account** as the dev connector. Use the **test** key (`sk_test_`) to run the live URL in sandbox mode (card 4242 works); the test catalog already exists. A **live** key (`sk_live_`) has a SEPARATE empty catalog — create products/prices in live mode first.
- **Verify the key VALUE, not just its presence.** A correct-place/right-account key can STILL leave the catalog empty if the value is a *truncated* key. Stripe's API-keys page masks the middle of the secret (shows only `sk_test_51xxxxx…last4`, ~14+4 visible chars; a real key is ~107). Copying the visible text (instead of Stripe's copy button) pastes an invalid key → `initStripe()` 401s → empty `/billing/prices`. Diagnose by calling `GET https://api.stripe.com/v1/products` with the key (read-only): 401 `Invalid API Key` = bad/truncated value, not a topology problem. Fix = re-copy the FULL key via Stripe's copy/reveal (or create a fresh key) and redeploy.
- `STRIPE_WEBHOOK_SECRET` is NOT required: the managed webhook stores its secret in `stripe."_managed_webhooks"`; both the lib's verifier and `resolveManagedWebhookSecret()` read it from there.

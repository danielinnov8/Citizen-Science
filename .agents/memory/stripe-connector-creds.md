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

**Why:** These are all silent mismatches between the Replit connector API response shape and what the stripe-replit-sync template assumes.

**How to apply:** Any time the Stripe integration is re-wired (new Repl, Cloud Run deploy, fresh checkout), verify these 5 points before debugging why products/prices aren't showing up.

## Publishing Stripe to the Cloud Run deployment

Symptom: dev `/pricing` works (top-ups "Buy now", checkout creates sessions) but the **published** site shows top-ups greyed "Coming soon" and subscription/founding buttons do nothing. Cause: `/api/billing/prices` returns empty on prod, so the frontend never gets price IDs (top-ups disable, checkout early-returns on missing priceId). The frontend is correct — do NOT rewrite it.

Root cause: prod (Replit Cloud Run deploy) can't reach the Replit Stripe connector. `getStripeCredentials()` is env-first: it needs `STRIPE_SECRET_KEY` in the environment, else it falls back to the connector (which only works in the dev Repl). With no key, boot `initStripe()` skips → no products/prices synced → empty catalog.

Fix (no code change): set `STRIPE_SECRET_KEY` scoped to **production only** (not a global secret — global would override the dev connector via env-first; production-scoped keeps dev untouched), then **republish** (a running deploy won't pick up new env until redeployed). On boot prod runs migrations → `findOrCreateManagedWebhook` (registers the prod webhook + stores its signing secret) → `syncBackfill({object:"all"})` pulls the catalog.

**Why:** mirrors the Gemini "own API key on Cloud Run" pattern — Replit connectors are unreachable off-Replit.

**How to apply:**
- Use the same Stripe **account** as the dev connector. Use the **test** key (`sk_test_`) to run the live URL in sandbox mode (card 4242 works); the test catalog already exists. A **live** key (`sk_live_`) has a SEPARATE empty catalog — products/prices must be created in live mode first (Replit's Publish-pane Stripe flow copies test→live, or run the seed against live).
- `STRIPE_WEBHOOK_SECRET` is NOT required: the managed webhook stores its secret in `stripe."_managed_webhooks"`; both the lib's verifier and `resolveManagedWebhookSecret()` read it from there.

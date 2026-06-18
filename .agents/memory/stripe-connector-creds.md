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

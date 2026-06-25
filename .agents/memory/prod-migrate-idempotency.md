---
name: Prod boot-migrate must be idempotent
description: Why every versioned drizzle migration must be safely re-runnable on this project, and the failure modes that broke prod auth.
---

# Prod boot-migrate migrations must be idempotent

The API server runs versioned drizzle migration SQL files at boot (`runMigrations`).
Dev syncs schema with `drizzle-kit push`, which **never executes the migration files**.
So a broken/non-idempotent migration passes silently on dev and only explodes on prod.

**Rule:** every migration file must be safely re-runnable / tolerant of partially-present schema:
- `CREATE TYPE` has **no** `IF NOT EXISTS` in Postgres → wrap in
  `DO $$ BEGIN CREATE TYPE ...; EXCEPTION WHEN duplicate_object THEN null; END $$;`
- `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS`
- `ADD COLUMN` → `ADD COLUMN IF NOT EXISTS`
- `ADD CONSTRAINT` → `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;`
- keep the `--> statement-breakpoint` separators; each `DO $$ ... $$;` is one statement.

**Why:** drizzle runs each migration in one transaction. A single bare `CREATE TYPE`/`ADD COLUMN`
on an already-existing object throws, aborts the whole transaction, the migration is **not** recorded,
and the chain re-fails on every boot — so every later migration never applies. That is exactly what
stranded `users.stripe_customer_id/stripe_subscription_id` and made all auth 500 in prod.

**Two drift traps seen here:**
1. **Duplicated migrations** (`0012` and `0014` both created the same `prospect_*` enums + `outreach_*`
   tables) — whichever runs second hits "already exists" and aborts the chain.
2. **Bad `when` timestamp** — the runtime migrator gates by `meta/_journal.json` `when` vs the max
   recorded `created_at` (NOT by hash). A migration whose `when` is earlier than the baseline (e.g.
   `0011_add_stripe_columns` set to 2025 while the baseline is 2026) is **silently skipped forever**.
   Don't rely on such a migration; fold its effect into a properly-timestamped idempotent one.

**Snapshot vs journal drift:** a table can live in `meta/NNNN_snapshot.json` yet have no journaled SQL
that creates it (here `stripe_processed_events` was only in a non-journaled orphan file) → it never gets
created on prod. Fix = a journaled `CREATE TABLE IF NOT EXISTS` migration. When you add a journaled
migration by hand, also add a matching `meta/NNNN_snapshot.json` (copy the prior snapshot, set a new
`id` and `prevId` = prior id) or `drizzle-kit generate` will break.

**How to validate without prod access:** run the rewritten migration SQL **twice** against the dev DB
(which already has the full schema). If both passes succeed as no-ops, the SQL is syntactically valid
and idempotent.

**How to apply:** when prod is stuck this way, give the user immediate idempotent SQL to paste in their
prod console (e.g. the missing `users` ADD COLUMN IF NOT EXISTS + the missing table) to unblock without
a redeploy; the idempotent migration files then make the next redeploy self-heal the whole chain.

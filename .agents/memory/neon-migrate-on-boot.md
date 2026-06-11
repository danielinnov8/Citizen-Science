---
name: Neon schema auto-migrate on boot (Cloud Run)
description: How/why the API applies versioned drizzle migrations at startup so a GitHub→Cloud Run deploy updates the Neon schema automatically.
---

# Neon schema migrates automatically at API boot

The schema is kept in sync via **versioned drizzle migrations applied
programmatically when the API server boots** — not by the Cloud Run build, and
not manually. Flow: `drizzle-kit generate` writes committed SQL under
`lib/db/migrations`; `runMigrations()` (drizzle node-postgres migrator) runs them
against `DATABASE_URL` at startup, before serving DB-backed routes. A
GitHub-sync → Cloud Run build still only rebuilds the container; the *running
container* does the migration on first boot.

**Why:** the user wants "the DB to update with each commit." Cloud Run is the only
place the Neon `DATABASE_URL` is reliably available, so migrate-on-boot is the
fit (a build step would need build-time DB creds). Replit Publish's schema-diff
does NOT apply (Cloud Run + own Neon, not Replit Deployments).

**Non-obvious constraints (each cost real care):**
- **Baseline 0000 must be idempotent.** Migrations are being introduced onto
  already-populated, *differently-drifted* DBs: a fresh empty DB, the full dev DB,
  and the partial Neon prod DB (tables exist, columns missing). So the baseline
  uses `CREATE TABLE/INDEX IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, and a
  `DO`-block-guarded FK add. Hand-edit the generated `.sql`, but **do NOT edit the
  `meta/` snapshot** — future `drizzle-kit generate` diffs against it.
- **migrationsFolder path under esbuild.** The server is bundled to one
  `dist/index.mjs`, so `__dirname` is useless for finding the SQL. Resolve via
  `require.resolve("@workspace/db/package.json")` (requires `"./package.json"` in
  the db package `exports`). `pnpm deploy` ships `lib/db/migrations` into
  `/app/node_modules/@workspace/db/migrations`, so this resolves in dev + prod.
- **Cold-start race.** Migrations are started before `app.listen` (non-blocking,
  never rejects, to preserve boot-without-DB resilience) and `/api` routes are
  gated behind a bounded migration-ready wait (`/healthz` exempt). Otherwise a
  request can hit a not-yet-migrated schema in the first sub-second after deploy.
- **Advisory lock must be BEST-EFFORT on pooled endpoints.** `runMigrations`
  tries a session-level `pg_advisory_lock` on a dedicated client for
  multi-instance safety, but **Neon's pooled endpoint (pgbouncer transaction
  mode) REJECTS session advisory locks** — and that throw was the very first
  query, so it aborted the entire migration step. On Neon-backed prod this meant
  migrate-on-boot NEVER ran (no journal, no new tables, `users` missing `plan`)
  → every DB-backed route 500'd, while dev (Replit Helium, non-pooled) worked
  fine. Fix: wrap the lock in try/catch and proceed WITHOUT it on failure (the
  idempotent SQL makes a rare concurrent run harmless); only `pg_advisory_unlock`
  if the lock was actually acquired. **Why:** session-pooled Postgres silently
  diverges from direct Postgres on session-scoped features.

**How to apply:** add a schema change → `pnpm --filter @workspace/db run generate`
→ commit the new SQL + meta → deploy. The new migration applies automatically on
the next boot.

**`CREATE TABLE IF NOT EXISTS` does NOT reconcile a pre-existing drifted table.**
If a table was created by an early `drizzle-kit push` BEFORE the versioned
baseline, the baseline's `CREATE TABLE IF NOT EXISTS` is a full no-op on it and
will NEVER add later columns (this is exactly how prod `users` ended up missing
`plan`). Pre-existing tables need EXPLICIT `ALTER TABLE ... ADD COLUMN IF NOT
EXISTS` statements — only brand-new tables benefit from CREATE. Add such
reconciliation as a hand-written custom migration: `drizzle-kit generate
--custom --name <x>` (creates the journal entry + snapshot copy correctly), then
write the idempotent ALTERs into the empty `.sql`. Verify by replaying the
migrator against a throwaway local Postgres seeded with the OLD drifted schema.

**Incremental migrations also need idempotency if you `push` to dev first.**
`drizzle-kit push` creates the table WITHOUT recording it in the migration
journal, so the next boot's migrator re-runs the generated `CREATE TABLE` and
fails with `relation "..." already exists` (it crashes the whole migration step).
Hand-edit each new migration's `CREATE TABLE`/`CREATE INDEX`/`ADD COLUMN` to the
`IF NOT EXISTS` form (do NOT touch `meta/`). Prefer this over relying on a clean
generate — the original "incremental migrations generate cleanly" assumption only
holds when you never `push` between generate and boot.

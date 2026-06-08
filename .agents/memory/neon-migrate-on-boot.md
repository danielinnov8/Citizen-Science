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
- Multi-instance safe: `runMigrations` holds a pg advisory lock on a dedicated
  client so concurrent Cloud Run instances don't race.

**How to apply:** add a schema change → `pnpm --filter @workspace/db run generate`
→ commit the new SQL + meta → deploy. The new migration applies automatically on
the next boot. Only the original baseline needed hand-editing for idempotency;
incremental migrations generate cleanly (all DBs are at baseline afterward).

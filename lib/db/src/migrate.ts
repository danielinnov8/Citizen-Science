import { createRequire } from "node:module";
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

// A constant 64-bit key for the Postgres advisory lock that serializes
// migrations across concurrently-booting instances (e.g. Cloud Run scaling up
// several containers at once). Any stable arbitrary number works.
const MIGRATION_LOCK_KEY = 776655443322n;

// Resolve the migrations folder relative to THIS package rather than the running
// bundle. The api-server is esbuild-bundled into a single dist/index.mjs, so
// __dirname there points at the bundle dir, not lib/db. Resolving via the
// package keeps the path correct in dev (workspace symlink) and in the deployed
// container (/app/node_modules/@workspace/db/migrations).
function resolveMigrationsFolder(): string {
  const require = createRequire(import.meta.url);
  const pkgPath = require.resolve("@workspace/db/package.json");
  return path.join(path.dirname(pkgPath), "migrations");
}

/**
 * Apply any pending versioned SQL migrations to the database pointed at by
 * DATABASE_URL. Safe to call on every boot: drizzle records applied migrations
 * in a tracking table and skips ones already run. Wrapped in a Postgres
 * advisory lock so multiple instances booting at once don't race.
 *
 * Never throws — a migration failure is logged by the caller and the server
 * keeps serving (DB-backed routes will surface their own errors), mirroring the
 * lazy-connection philosophy of the db client.
 */
export async function runMigrations(options?: {
  /**
   * Invoked when the session-level advisory lock could not be acquired (e.g. a
   * pooled endpoint that rejects it) and migrations proceed without it. Lets the
   * caller surface an operability warning; defaults to a no-op.
   */
  onAdvisoryLockUnavailable?: (err: unknown) => void;
}): Promise<void> {
  const migrationsFolder = resolveMigrationsFolder();
  const client = await pool.connect();
  let locked = false;
  try {
    // Best-effort cross-instance serialization. Some connection poolers — most
    // notably Neon's pooled endpoint (pgbouncer in transaction-pooling mode) —
    // reject SESSION-level advisory locks like pg_advisory_lock, which throws
    // here. Historically that error aborted the entire migration step (the
    // advisory lock is the very FIRST query), so on Neon-backed prod the schema
    // never migrated and DB-backed routes 500'd while dev (non-pooled) worked.
    // The migrations are fully idempotent (IF NOT EXISTS / ADD COLUMN IF NOT
    // EXISTS), so if the lock is unavailable we proceed WITHOUT it; a rare
    // concurrent run during a multi-instance cold start is harmless.
    try {
      await client.query("SELECT pg_advisory_lock($1)", [
        MIGRATION_LOCK_KEY.toString(),
      ]);
      locked = true;
    } catch (err) {
      // Pooler doesn't support session advisory locks — continue unlocked.
      options?.onAdvisoryLockUnavailable?.(err);
    }
    await migrate(db, { migrationsFolder });
  } finally {
    if (locked) {
      try {
        await client.query("SELECT pg_advisory_unlock($1)", [
          MIGRATION_LOCK_KEY.toString(),
        ]);
      } catch {
        // Ignore unlock failures — the session ends on release() anyway.
      }
    }
    client.release();
  }
}

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
export async function runMigrations(): Promise<void> {
  const migrationsFolder = resolveMigrationsFolder();
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [
      MIGRATION_LOCK_KEY.toString(),
    ]);
    await migrate(db, { migrationsFolder });
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [
      MIGRATION_LOCK_KEY.toString(),
    ]);
    client.release();
  }
}

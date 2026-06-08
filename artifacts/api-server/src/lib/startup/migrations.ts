import { runMigrations } from "@workspace/db";
import { logger } from "../logger";

// Upper bound on how long a DB-backed request will wait for migrations to settle
// before proceeding in a degraded mode. Migrations are normally sub-second; this
// only guards the pathological case (e.g. DB unreachable) so requests never hang
// indefinitely behind the gate.
const MIGRATION_WAIT_TIMEOUT_MS = 15_000;

let migrationPromise: Promise<void> | null = null;

/**
 * Kick off schema migrations exactly once. The returned promise SETTLES (never
 * rejects) once migrations have been attempted — success and failure both
 * resolve it — so the request gate can hold traffic until the schema is ready
 * without ever blocking forever. Call this before `app.listen` so the gate
 * always has a promise to await.
 */
export function startMigrations(): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = runMigrations()
    .then(() => {
      logger.info("Database migrations applied");
    })
    .catch((err: unknown) => {
      // Non-fatal: keep serving so the SPA and /healthz stay up even if the DB
      // is misconfigured. DB-backed routes will surface their own errors.
      logger.error({ err }, "Database migrations failed");
    });
  return migrationPromise;
}

/**
 * Block until migrations have settled, or a bounded timeout elapses. No-ops when
 * migrations were never started. After the first settle this returns
 * effectively instantly, so the steady-state per-request overhead is nil.
 */
export async function awaitMigrations(): Promise<void> {
  if (!migrationPromise) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, MIGRATION_WAIT_TIMEOUT_MS);
  });
  try {
    await Promise.race([migrationPromise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

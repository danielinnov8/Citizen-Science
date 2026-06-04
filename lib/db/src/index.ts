import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Schema = typeof schema;

let _pool: pg.Pool | null = null;
let _db: NodePgDatabase<Schema> | null = null;

// Connect lazily on first use rather than at import time. This keeps the server
// bootable (so it can serve static assets and /healthz) even when DATABASE_URL
// is not configured yet — e.g. a fresh Cloud Run deploy. DB-backed routes then
// fail per-request with a clear error instead of crash-looping the whole
// container at startup, which would also take down the bundled frontend.
function init(): void {
  if (_db) return;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  _pool = new Pool({ connectionString });
  _db = drizzle(_pool, { schema });
}

function lazyProxy<T extends object>(get: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const target = get();
      const value = Reflect.get(target as object, prop);
      // Bind methods to the real instance so `this` is never the proxy — drizzle
      // and pg rely on private fields that are unreachable through a Proxy.
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const db: NodePgDatabase<Schema> = lazyProxy(() => {
  init();
  return _db as NodePgDatabase<Schema>;
});

export const pool: pg.Pool = lazyProxy(() => {
  init();
  return _pool as pg.Pool;
});

export * from "./schema";

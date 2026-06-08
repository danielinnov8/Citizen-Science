import app from "./app";
import { logger } from "./lib/logger";
import { seedFeaturedProfiles } from "./lib/seed/featuredProfiles";
import { startMigrations } from "./lib/startup/migrations";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Kick off schema migrations BEFORE we start accepting traffic so the /api gate
// (see app.ts) can hold DB-backed requests until the schema is ready — a
// cold-start deploy never serves a route against a not-yet-migrated schema. This
// does NOT block listen: startMigrations returns immediately and never rejects,
// so the server still boots and serves /healthz + static even if the DB is down.
const migrations = startMigrations();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Once migrations have settled, seed the directory's featured profiles if the
  // table is empty (idempotent — no-ops when already populated).
  void migrations.then(() => {
    void seedFeaturedProfiles();
  });
});

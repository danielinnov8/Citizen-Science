import app from "./app";
import { logger } from "./lib/logger";
import { seedFeaturedProfiles } from "./lib/seed/featuredProfiles";

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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Seed the directory's featured profiles if the database is empty. Runs in the
  // background so it never delays readiness; it no-ops when already populated.
  void seedFeaturedProfiles();
});

import app from "./app";
import { logger } from "./lib/logger";
import { seedFeaturedProfiles } from "./lib/seed/featuredProfiles";
import { seedChallenges as seedChallengesData, seedManuSolution, seedMultiplanetaryChallenge, seedElonSolution } from "./lib/seed/challenges";
import { seedChallengeContributors } from "./lib/seed/challenge-contributors";
import { startMigrations } from "./lib/startup/migrations";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./lib/stripe/stripeClient";

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
  // table is empty (idempotent — no-ops when already populated), then boot
  // the Stripe integration (stripe schema + managed webhook + initial backfill).
  void migrations.then(async () => {
    void seedFeaturedProfiles();
    void seedChallengesData()
      .then(() => seedMultiplanetaryChallenge())
      .then(() => seedElonSolution())
      .then(() => seedManuSolution())
      .then(() => seedChallengeContributors());
    void initStripe();
  });
});

// Initialize Stripe schema, managed webhook, and data backfill. Called once
// after app migrations settle. Never throws into the boot sequence — a missing
// Stripe integration degrades gracefully (checkout routes return 503).
async function initStripe(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set — skipping Stripe init");
    return;
  }

  try {
    // 1. Create/migrate the stripe schema (idempotent).
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    // 2. Get a StripeSync instance (after migrations so the schema exists).
    const stripeSync = await getStripeSync();

    // 3. Register or locate the managed webhook for this deployment. Prefer
    //    PUBLIC_BASE_URL (set on the user's own Cloud Run host, where
    //    REPLIT_DOMAINS does not exist) and fall back to REPLIT_DOMAINS on
    //    Replit — mirrors the success/cancel/return URL derivation in
    //    routes/billing.ts and the OAuth redirect derivation.
    const base =
      process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
      (process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]?.trim()}`
        : "");
    if (base) {
      const webhookUrl = `${base}/api/stripe/webhook`;
      await stripeSync.findOrCreateManagedWebhook(webhookUrl);
      logger.info({ webhookUrl }, "Stripe webhook configured");
    }

    // 4. Backfill existing Stripe data into the local stripe schema (async —
    //    doesn't block the server; errors are logged, not fatal).
    stripeSync.syncBackfill({ object: "all" }).then((result) => {
      logger.info({ result }, "Stripe data backfill complete");
    }).catch((err: unknown) => {
      logger.warn({ err }, "Stripe backfill failed (non-fatal)");
    });
  } catch (err) {
    // Missing integration key, network error, etc. — log and continue.
    // The checkout/portal routes detect the missing client and return 503.
    logger.warn({ err }, "Stripe init skipped (integration not connected?)");
  }
}

import { sql } from "drizzle-orm";
import {
  db,
  featuredProfilesTable,
  type InsertFeaturedProfile,
} from "@workspace/db";
import seedData from "../../data/featured-profiles.json" with { type: "json" };
import { logger } from "../logger";

const SEED_PROFILES = seedData as InsertFeaturedProfile[];

/**
 * Idempotently seeds the directory's featured profiles into the database.
 *
 * Replit's publish flow syncs the SCHEMA from dev to prod but never copies data,
 * so a freshly published production database starts empty and every DB-backed
 * profile page 404s. This seeder bridges that gap: on boot it checks whether the
 * table already has rows and, if empty, bulk-inserts the committed snapshot
 * (`data/featured-profiles.json`, produced by `dump-featured-profiles`).
 *
 * It is safe to run on every start and across multiple instances: it no-ops when
 * the table is already populated, and inserts use `ON CONFLICT (slug) DO NOTHING`
 * so concurrent boots can't create duplicates. Failures are logged, never thrown,
 * so seeding can never take the server down.
 */
export async function seedFeaturedProfiles(): Promise<void> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(featuredProfilesTable);

    if (count > 0) {
      logger.info(
        { count },
        "Featured profiles already present, skipping seed",
      );
      return;
    }

    if (SEED_PROFILES.length === 0) {
      logger.warn("No featured-profile seed data available, skipping seed");
      return;
    }

    await db
      .insert(featuredProfilesTable)
      .values(SEED_PROFILES)
      .onConflictDoNothing({ target: featuredProfilesTable.slug });

    logger.info(
      { seeded: SEED_PROFILES.length },
      "Seeded featured profiles into empty database",
    );
  } catch (err) {
    logger.error({ err }, "Failed to seed featured profiles");
  }
}

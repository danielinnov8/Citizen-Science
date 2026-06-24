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
 * profile page 404s. This seeder bridges that gap: on every boot it bulk-inserts
 * the committed snapshot (`data/featured-profiles.json`, produced by
 * `dump-featured-profiles`) using `ON CONFLICT (slug) DO NOTHING`, so existing
 * rows are never overwritten and concurrent boots can't create duplicates.
 * Failures are logged, never thrown, so seeding can never take the server down.
 */
export async function seedFeaturedProfiles(): Promise<void> {
  try {
    if (SEED_PROFILES.length === 0) {
      logger.warn("No featured-profile seed data available, skipping seed");
      return;
    }

    const result = await db
      .insert(featuredProfilesTable)
      .values(SEED_PROFILES)
      .onConflictDoNothing({ target: featuredProfilesTable.slug });

    const inserted = result.rowCount ?? 0;
    const skipped = SEED_PROFILES.length - inserted;

    logger.info(
      { total: SEED_PROFILES.length, inserted, skipped },
      "Featured profiles seed complete",
    );
  } catch (err) {
    logger.error({ err }, "Failed to seed featured profiles");
  }
}

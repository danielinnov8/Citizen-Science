/**
 * Dumps the development `featured_profiles` table to a committed JSON snapshot
 * that the API server seeds into an empty database on boot.
 *
 * Replit's publish flow syncs the database SCHEMA from dev to prod, but it does
 * NOT copy data. The directory profiles are Gemini-generated and live only in
 * the dev DB, so a freshly published production database starts empty and every
 * DB-backed profile page 404s. This snapshot is the bridge: re-run it whenever
 * the dev directory data changes, commit the result, and the server's boot-time
 * seeder will populate any empty database from it.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run dump-featured-profiles
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { asc } from "drizzle-orm";
import { db, pool, featuredProfilesTable } from "@workspace/db";

const OUT_PATH = resolve(
  import.meta.dirname,
  "../../artifacts/api-server/src/data/featured-profiles.json",
);

async function main(): Promise<void> {
  const rows = await db
    .select()
    .from(featuredProfilesTable)
    .orderBy(asc(featuredProfilesTable.name));

  // Strip DB-managed columns so the seed inserts use server defaults.
  const seed = rows.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => {
    void _id;
    void _c;
    void _u;
    return rest;
  });

  writeFileSync(OUT_PATH, JSON.stringify(seed, null, 2) + "\n", "utf8");
  console.log(`Wrote ${seed.length} profiles to ${OUT_PATH}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

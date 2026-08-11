// Resumable bulk driver for AI contact research over directory prospects.
//
// Mirrors the /admin/outreach/research-contacts endpoint loop (same
// researchProspectContact call, same row update) but with a concurrency pool so
// a full queue can be cleared without 30+ manual button clicks. Idempotent:
// only prospects with researchedAt IS NULL are picked up, and researchedAt is
// stamped only on success — re-run freely after interruption.
//
// Safety: results go to contactInfo (AI-suggested, needs admin review). The
// sendable `email` column is NEVER touched here — promotion is a manual admin
// action in the portal.
//
// Usage (from artifacts/api-server):
//   node scripts/build-research.mjs
//   NODE_ENV=production node /tmp/research-contacts.mjs --limit 60 --concurrency 4
// Re-run the node command freely — each pass picks up where the last stopped.

import { and, eq, isNull } from "drizzle-orm";
import {
  db,
  featuredProfilesTable,
  outreachProspectsTable,
} from "@workspace/db";
import { researchProspectContact } from "../src/lib/outreach/research";

const args = process.argv.slice(2);
const numArg = (flag: string, dflt: number): number => {
  const i = args.indexOf(flag);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : dflt;
};
const LIMIT = numArg("--limit", 50);
const CONCURRENCY = Math.min(8, numArg("--concurrency", 4));

async function main(): Promise<void> {
  const rows = await db
    .select({
      id: outreachProspectsTable.id,
      name: outreachProspectsTable.name,
      field: featuredProfilesTable.field,
      era: featuredProfilesTable.era,
    })
    .from(outreachProspectsTable)
    .leftJoin(
      featuredProfilesTable,
      eq(outreachProspectsTable.profileId, featuredProfilesTable.id),
    )
    .where(
      and(
        eq(outreachProspectsTable.source, "directory"),
        isNull(outreachProspectsTable.researchedAt),
      ),
    )
    .orderBy(outreachProspectsTable.createdAt)
    .limit(LIMIT);

  console.log(
    `research-contacts: batch of ${rows.length} (limit=${LIMIT}, concurrency=${CONCURRENCY})`,
  );

  let done = 0;
  let withEmail = 0;
  let failed = 0;
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < rows.length) {
      const r = rows[cursor++];
      try {
        const info = await researchProspectContact({
          name: r.name,
          field: r.field,
          era: r.era,
        });
        await db
          .update(outreachProspectsTable)
          .set({
            contactInfo: info,
            researchedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(outreachProspectsTable.id, r.id));
        done++;
        if (info.email) withEmail++;
        console.log(
          `[${done + failed}/${rows.length}] ${r.name} — email: ${info.email ?? "—"}, site: ${info.website ?? "—"}`,
        );
      } catch (err) {
        failed++;
        console.log(
          `[fail] ${r.name}: ${(err as Error).message?.slice(0, 140) ?? err}`,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(
    `research-contacts: done=${done} withEmail=${withEmail} failed=${failed}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

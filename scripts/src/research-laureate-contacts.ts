/**
 * Queue LIVING Nobel laureates as outreach prospects and research their public
 * contact channels (email, website, socials) with a Google-Search-grounded
 * Gemini pass.
 *
 * Phase 1 — QUEUE: every living laureate (a `featured_profiles` row with a
 * non-empty `nobelPrizes` array whose era does NOT read as a closed lifespan)
 * is inserted into `outreach_prospects` as a directory-sourced prospect in the
 * `needs_review` state with NO sendable email. Idempotent: the unique index on
 * `profile_id` + `onConflictDoNothing` means re-running never duplicates.
 *
 * Phase 2 — RESEARCH: all directory-sourced prospects with `researchedAt` NULL
 * are processed by a concurrency-bounded worker pool calling the shared
 * `researchPublicContact` helper (the SAME prompt/sanitizer the admin route
 * uses — nothing is ever fabricated). Results land in `contactInfo` (the
 * suggested email is a CANDIDATE only; an admin must approve it before it is
 * promoted to the sendable `email` column) and `researchedAt` is stamped only
 * on success, so an interrupted run safely resumes.
 *
 * NOTHING IS EVER SENT by this script. The outreach scheduler only sends
 * prospects that are status=pending AND review_state=approved AND email set —
 * all of which require explicit admin review in the portal.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run research-laureate-contacts [limit] [concurrency]
 *
 * `limit` (default 40) caps how many prospects are researched this pass.
 * `concurrency` (default 1) sizes the worker pool; a 429 from any worker
 * stops the pass gracefully.
 */
import { and, eq, isNull, sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  outreachProspectsTable,
} from "@workspace/db";
import {
  isGeminiConfigured,
  researchPublicContact,
} from "@workspace/integrations-gemini-ai-server";

const LIMIT = Math.max(1, Number(process.argv[2] ?? 40) || 40);
const CONCURRENCY = Math.max(1, Number(process.argv[3] ?? 1) || 1);
const PACE_MS = 2000;

// Mirrors `isLivingEra` in artifacts/api-server/src/lib/profiles/living.ts —
// a closed YYYY–YYYY range in the era string means the figure is historical.
// Keep in lockstep with the server.
const CLOSED_RANGE_RE = /\b\d{4}\s*[-–—]\s*\d{4}\b/;
function isLivingEra(era: string | null | undefined): boolean {
  if (!era) return false; // no era signal = treat as historical, like the server
  return !CLOSED_RANGE_RE.test(era);
}

// Mirrors `prospectTypeForGroup` in artifacts/api-server/src/routes/admin.ts.
function prospectTypeForGroup(
  group: string,
): "researcher" | "scientist" | "investor" | "user" {
  switch (group) {
    case "scientist":
      return "scientist";
    case "inventor":
      return "scientist";
    case "thought_leader":
      return "researcher";
    case "organization":
      return "user";
    default:
      return "scientist";
  }
}

async function queueLivingLaureates(): Promise<void> {
  const laureates = await db
    .select({
      id: featuredProfilesTable.id,
      name: featuredProfilesTable.name,
      group: featuredProfilesTable.group,
      era: featuredProfilesTable.era,
      summary: featuredProfilesTable.summary,
    })
    .from(featuredProfilesTable)
    .where(sql`jsonb_array_length(${featuredProfilesTable.nobelPrizes}) > 0`);

  const living = laureates.filter((p) => isLivingEra(p.era));
  let queued = 0;
  for (const p of living) {
    const rows = await db
      .insert(outreachProspectsTable)
      .values({
        name: p.name,
        email: null,
        type: prospectTypeForGroup(p.group),
        notes: p.summary?.slice(0, 500) ?? "",
        status: "pending",
        profileId: p.id,
        source: "directory",
        reviewState: "needs_review",
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ id: outreachProspectsTable.id });
    if (rows.length > 0) queued++;
  }
  console.log(
    `Queue: ${laureates.length} laureates, ${living.length} living, ${queued} newly queued, ${living.length - queued} already present.`,
  );
}

async function main(): Promise<void> {
  if (!isGeminiConfigured()) {
    console.error("GEMINI_API_KEY is not configured; cannot research.");
    process.exit(1);
  }

  await queueLivingLaureates();

  const batch = await db
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
    `Researching ${batch.length} prospects this pass with concurrency ${CONCURRENCY}.`,
  );

  let researched = 0;
  let withEmail = 0;
  let failed = 0;
  let stopped = false;

  async function processOne(p: (typeof batch)[number]): Promise<boolean> {
    try {
      const info = await researchPublicContact({
        name: p.name,
        field: p.field,
        era: p.era,
      });
      await db
        .update(outreachProspectsTable)
        .set({
          contactInfo: info,
          researchedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(outreachProspectsTable.id, p.id));
      researched++;
      if (info.email) {
        withEmail++;
        console.log(`  ✓ ${p.name}: email found`);
      } else {
        console.log(
          `  - ${p.name}: no public email${info.website ? " (website found)" : ""}`,
        );
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
        console.warn(
          `\n[429] Gemini quota reached at ${p.name}. Stopping; re-run later to resume.`,
        );
        return false;
      }
      failed++;
      console.warn(`  ! ${p.name}: ${msg}`);
      return true;
    }
  }

  let cursor = 0;
  async function worker(): Promise<void> {
    while (!stopped) {
      const idx = cursor++;
      if (idx >= batch.length) break;
      const ok = await processOne(batch[idx]);
      if (!ok) {
        stopped = true;
        break;
      }
      if (CONCURRENCY === 1) {
        await new Promise((r) => setTimeout(r, PACE_MS));
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, batch.length) }, () => worker()),
  );

  const [remaining] = await db
    .select({ c: sql<number>`count(*)` })
    .from(outreachProspectsTable)
    .where(
      and(
        eq(outreachProspectsTable.source, "directory"),
        isNull(outreachProspectsTable.researchedAt),
      ),
    );

  console.log(
    `\nDone. Researched ${researched} (${withEmail} with a public email, ${failed} failed). Remaining unresearched: ${remaining?.c ?? "?"}.`,
  );
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

/**
 * SECOND, deeper email-hunting pass over directory outreach prospects whose
 * first research pass found NO public email.
 *
 * Targets: source=directory prospects already researched (`researchedAt` set)
 * with no suggested email (`contactInfo.email` empty) and not yet deep-searched
 * (`contactInfo.deepSearched` unset). Each is run through the shared
 * `researchDeepContact` helper, which digs into faculty/lab pages, staff
 * directories, CVs, corresponding-author lines, and press offices — and may
 * return an INSTITUTIONAL fallback address (department office, press contact,
 * agent) with a note stating exactly whose address it is. Nothing is ever
 * fabricated.
 *
 * Results are MERGED into the existing `contactInfo` (new non-empty fields win;
 * pass-1 findings are kept otherwise) and `deepSearched: true` is stamped so an
 * interrupted run safely resumes. The suggested email remains a CANDIDATE only:
 * an admin must approve the prospect before anything becomes sendable, and
 * NOTHING IS EVER SENT by this script.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run deep-research-laureate-emails [limit] [concurrency]
 */
import { and, eq, isNotNull, sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  outreachProspectsTable,
  type ProspectContactInfo,
} from "@workspace/db";
import {
  isGeminiConfigured,
  researchDeepContact,
} from "@workspace/integrations-gemini-ai-server";

const LIMIT = Math.max(1, Number(process.argv[2] ?? 40) || 40);
const CONCURRENCY = Math.max(1, Number(process.argv[3] ?? 1) || 1);
const PACE_MS = 2000;

const NEEDS_DEEP_SEARCH = and(
  eq(outreachProspectsTable.source, "directory"),
  isNotNull(outreachProspectsTable.researchedAt),
  sql`coalesce(${outreachProspectsTable.contactInfo}->>'email', '') = ''`,
  sql`(${outreachProspectsTable.contactInfo}->>'deepSearched') IS NULL`,
);

async function main(): Promise<void> {
  if (!isGeminiConfigured()) {
    console.error("GEMINI_API_KEY is not configured; cannot research.");
    process.exit(1);
  }

  const batch = await db
    .select({
      id: outreachProspectsTable.id,
      name: outreachProspectsTable.name,
      contactInfo: outreachProspectsTable.contactInfo,
      field: featuredProfilesTable.field,
      era: featuredProfilesTable.era,
    })
    .from(outreachProspectsTable)
    .leftJoin(
      featuredProfilesTable,
      eq(outreachProspectsTable.profileId, featuredProfilesTable.id),
    )
    .where(NEEDS_DEEP_SEARCH)
    .orderBy(outreachProspectsTable.createdAt)
    .limit(LIMIT);

  console.log(
    `Deep-searching ${batch.length} email-less prospects this pass with concurrency ${CONCURRENCY}.`,
  );

  let processed = 0;
  let withEmail = 0;
  let failed = 0;
  let stopped = false;

  async function processOne(p: (typeof batch)[number]): Promise<boolean> {
    try {
      const prev = p.contactInfo ?? {};
      const found = await researchDeepContact({
        name: p.name,
        field: p.field,
        era: p.era,
        knownWebsite: prev.website,
        knownContactPage: prev.contactPage,
      });
      // Merge: deep-pass findings win when non-empty, pass-1 data is kept
      // otherwise. Always stamp deepSearched so this row is never re-run.
      const merged: ProspectContactInfo = {
        email: found.email ?? prev.email ?? null,
        website: found.website ?? prev.website ?? null,
        contactPage: found.contactPage ?? prev.contactPage ?? null,
        socials: found.socials?.length ? found.socials : (prev.socials ?? []),
        notes: found.notes ?? prev.notes ?? null,
        deepSearched: true,
      };
      await db
        .update(outreachProspectsTable)
        .set({
          contactInfo: merged,
          researchedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(outreachProspectsTable.id, p.id));
      processed++;
      if (found.email) {
        withEmail++;
        console.log(`  ✓ ${p.name}: email found (deep)`);
      } else {
        console.log(`  - ${p.name}: still no published email`);
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
    .where(NEEDS_DEEP_SEARCH);

  console.log(
    `\nDone. Deep-searched ${processed} (${withEmail} new emails, ${failed} failed). Remaining: ${remaining?.c ?? "?"}.`,
  );
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

/**
 * Grounded generator that attributes challenge solutions to Nobel laureates.
 *
 * For every laureate in `featured_profiles` (a row with a non-empty
 * `nobelPrizes` array) this script cross-references their REAL, documented work
 * against the platform's grand challenges and, using a Google-Search-grounded
 * Gemini pass, writes 1–2 solution entries describing how that laureate's
 * actual research applies to the challenge. Solutions are framed as a grounded
 * interpretation of the laureate's contribution — never a fabricated quote and
 * never invented work. Each `authorSlug` links to the laureate's profile row so
 * the solution surfaces on both the profile page and the challenge page.
 *
 * Idempotent + resumable: a laureate who already has ANY challenge solution is
 * skipped, and an existing (challengeSlug, authorSlug) pair is never duplicated.
 * Safe to run in repeated, time-bounded passes — the Gemini free tier caps
 * grounded requests per day, so the script paces itself and backs off on 429.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-nobel-solutions [limit]
 *
 * `limit` (optional, default 12) caps how many NEW laureates are processed in
 * this pass so a single run stays within the daily Gemini quota.
 */
import { sql, inArray } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  challengesTable,
  challengeSolutionsTable,
} from "@workspace/db";
import {
  researchWithSearch,
  isGeminiConfigured,
} from "@workspace/integrations-gemini-ai-server";

interface ChallengeRef {
  slug: string;
  title: string;
  summary: string;
  domain: string;
}

interface GeneratedSolution {
  challengeSlug: string;
  title: string;
  description: string;
  approach: string;
  link: string | null;
}

const LIMIT = Math.max(1, Number(process.argv[2] ?? 12) || 12);
const PACE_MS = 4000;

function extractJson(text: string): unknown {
  // Gemini sometimes wraps JSON in ```json fences or prose — pull the first
  // balanced object/array out of the response.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("no JSON found in response");
  const open = candidate[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1));
      }
    }
  }
  throw new Error("unbalanced JSON in response");
}

function buildPrompt(
  laureate: {
    name: string;
    field: string | null;
    era: string | null;
    summary: string | null;
    contributions: string[] | null;
    nobelPrizes: { category: string; awardYear: string; motivation: string }[];
  },
  challenges: ChallengeRef[],
): string {
  const prizes = laureate.nobelPrizes
    .map((p) => `- ${p.category} (${p.awardYear}): ${p.motivation}`)
    .join("\n");
  const contribs = (laureate.contributions ?? []).slice(0, 6).join("; ");
  const challengeList = challenges
    .map((c) => `- ${c.slug} | ${c.title} [${c.domain}] — ${c.summary}`)
    .join("\n");

  return `You are a science historian linking a Nobel laureate's REAL, documented work to humanity's grand challenges.

LAUREATE: ${laureate.name}
Field: ${laureate.field ?? "unknown"}
Era: ${laureate.era ?? "unknown"}
Nobel Prize(s):
${prizes}
Summary: ${laureate.summary ?? "(none)"}
Known contributions: ${contribs || "(none)"}

GRAND CHALLENGES (use the slug exactly as written):
${challengeList}

TASK: Pick the 1 or 2 challenges where this laureate's ACTUAL research is most genuinely relevant. For each, write a solution describing how their real, documented work applies to that challenge. Rules:
- Ground every claim in their genuine, verifiable contributions. Do NOT invent work, results, quotes, or modern proposals they never made.
- Write in the third person about the laureate's work (e.g. "Curie's research on radioactivity enables..."). Never impersonate them or fabricate first-person quotes.
- If the laureate has NO genuine connection to any listed challenge, return an empty "solutions" array. Do not force a weak match.
- "link" must be a real, relevant URL (e.g. their Nobel page or Wikipedia) or null.

Respond with ONLY this JSON (no prose):
{
  "solutions": [
    {
      "challengeSlug": "<one of the slugs above>",
      "title": "<concise solution title, no laureate name>",
      "description": "<2-3 sentences grounding their real work in this challenge>",
      "approach": "<3-5 sentences on the concrete scientific approach drawn from their work>",
      "link": "<url or null>"
    }
  ]
}`;
}

async function main(): Promise<void> {
  if (!isGeminiConfigured()) {
    console.error("GEMINI_API_KEY not set — cannot generate solutions.");
    await pool.end();
    process.exit(1);
  }

  const challenges = (await db
    .select({
      slug: challengesTable.slug,
      title: challengesTable.title,
      summary: challengesTable.summary,
      domain: challengesTable.domain,
    })
    .from(challengesTable)) as ChallengeRef[];
  const challengeSlugs = new Set(challenges.map((c) => c.slug));
  console.log(`Loaded ${challenges.length} challenges.`);

  // Resumability: a laureate who already has ANY solution is done.
  const existing = await db
    .select({ authorSlug: challengeSolutionsTable.authorSlug })
    .from(challengeSolutionsTable);
  const authorsWithSolutions = new Set(
    existing.map((e) => e.authorSlug).filter((s): s is string => !!s),
  );

  const laureates = await db
    .select({
      slug: featuredProfilesTable.slug,
      name: featuredProfilesTable.name,
      field: featuredProfilesTable.field,
      era: featuredProfilesTable.era,
      summary: featuredProfilesTable.summary,
      contributions: featuredProfilesTable.contributions,
      nobelPrizes: featuredProfilesTable.nobelPrizes,
    })
    .from(featuredProfilesTable)
    .where(sql`jsonb_array_length(${featuredProfilesTable.nobelPrizes}) > 0`)
    .orderBy(featuredProfilesTable.name);

  const todo = laureates.filter((l) => !authorsWithSolutions.has(l.slug));
  console.log(
    `${laureates.length} laureates total, ${todo.length} still need solutions. Processing up to ${LIMIT} this pass.`,
  );

  let processed = 0;
  let inserted = 0;
  for (const laureate of todo) {
    if (processed >= LIMIT) break;
    processed++;

    let parsed: { solutions?: GeneratedSolution[] };
    try {
      const { text } = await researchWithSearch(
        buildPrompt(laureate, challenges),
        { maxOutputTokens: 2048 },
      );
      parsed = extractJson(text) as { solutions?: GeneratedSolution[] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
        console.warn(`\n[429] Daily Gemini quota reached at ${laureate.name}. Stopping; re-run later to resume.`);
        break;
      }
      console.warn(`  ! ${laureate.name}: ${msg}`);
      await new Promise((r) => setTimeout(r, PACE_MS));
      continue;
    }

    const candidates = (parsed.solutions ?? [])
      .filter((s) => s && challengeSlugs.has(s.challengeSlug) && s.title && s.description && s.approach)
      .slice(0, 2);

    if (candidates.length === 0) {
      console.log(`  - ${laureate.name}: no genuine challenge match`);
      await new Promise((r) => setTimeout(r, PACE_MS));
      continue;
    }

    // Guard against duplicate (challengeSlug, authorSlug) pairs.
    const pairExists = await db
      .select({ slug: challengeSolutionsTable.challengeSlug })
      .from(challengeSolutionsTable)
      .where(
        sql`${challengeSolutionsTable.authorSlug} = ${laureate.slug} AND ${inArray(
          challengeSolutionsTable.challengeSlug,
          candidates.map((c) => c.challengeSlug),
        )}`,
      );
    const taken = new Set(pairExists.map((p) => p.slug));
    const rows = candidates
      .filter((c) => !taken.has(c.challengeSlug))
      .map((c) => ({
        challengeSlug: c.challengeSlug,
        userId: null,
        authorName: laureate.name,
        authorSlug: laureate.slug,
        title: c.title.trim(),
        description: c.description.trim(),
        approach: c.approach.trim(),
        link: c.link && /^https?:\/\//.test(c.link) ? c.link : null,
      }));

    if (rows.length > 0) {
      await db.insert(challengeSolutionsTable).values(rows);
      inserted += rows.length;
      console.log(
        `  ✓ ${laureate.name}: +${rows.length} (${rows.map((r) => r.challengeSlug).join(", ")})`,
      );
    }

    await new Promise((r) => setTimeout(r, PACE_MS));
  }

  console.log(`\nDone. Processed ${processed} laureates, inserted ${inserted} solutions.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

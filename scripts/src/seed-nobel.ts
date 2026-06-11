/**
 * Seed for the Citizen Science "Scientists & Inventors" directory: imports
 * every Nobel laureate from the public Nobel Prize API (api.nobelprize.org
 * v2.1 — no API key, CC0 data) into the `featured_profiles` table.
 *
 * Covers all six categories — Physics, Chemistry, Physiology or Medicine,
 * Literature, Peace, and Economic Sciences — plus the Peace Prize
 * organizations (Red Cross, MSF, …). Each laureate becomes a directory row
 * keyed by a stable slug derived from their known name. The prize record
 * (category + year + motivation, supporting multiple wins) is stored in the
 * new `nobelPrizes` JSON column and surfaced as a badge in the UI.
 *
 * Mapping rules (see task #101):
 *   field   = the Nobel category (joined with " & " for multi-category wins)
 *   group   = "scientist" for any Physics/Chemistry/Medicine/Economics win,
 *             "thought_leader" for Literature/Peace-only people, and
 *             "organization" for organizations
 *   era     = derived from birth/death years (people) or founding year (orgs)
 *   summary + contributions = built from the prize motivation(s)
 *   relatedCategorySlugs = mapped only for the science categories
 *   sources = the Nobel laureate page + the laureate's Wikipedia article
 *   portrait = Wikipedia REST summary, keyed by the API-provided wiki slug
 *
 * Idempotency & safety:
 *   - Re-running never duplicates rows (keyed by slug).
 *   - Existing rows are NEVER content-clobbered: a collision only refreshes the
 *     `nobelPrizes` badge data, so hand-authored "great mind" figures (Einstein,
 *     Curie, …) and previously-researched rows keep their curated content.
 *   - Only brand-new laureates get a full insert + a portrait lookup, so the
 *     ~1000 Wikipedia calls only happen on the first pass and re-runs are fast.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-nobel            # import everyone
 *   pnpm --filter @workspace/scripts run seed-nobel -- 50      # first 50 only
 *   REFRESH_PRIZES=1 pnpm ... run seed-nobel                   # also re-pull portraits for existing
 */
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  type ProfileSource,
  type ProfileGroup,
  type ProfileNobelPrize,
} from "@workspace/db";

const NOBEL_API = "https://api.nobelprize.org/2.1/laureates";
const PAGE_SIZE = 100;

// Allowed Citizen Science category slugs (mirrors the frontend categories lib).
const CATEGORY_SLUGS = [
  "biology",
  "plant-science",
  "environmental-science",
  "water-quality",
  "chemistry",
  "physics",
  "human-health",
  "microbiology",
  "food-science",
  "agriculture",
  "neuroscience",
  "climate-science",
  "astronomy",
  "materials-science",
] as const;

// ---- Nobel API response shapes (only the fields we read) ----
interface LocalizedText {
  en?: string;
}
interface NobelPrizeEntry {
  awardYear?: string;
  category?: LocalizedText;
  categoryFullName?: LocalizedText;
  motivation?: LocalizedText;
  portion?: string;
}
interface NobelLink {
  rel?: string;
  href?: string;
}
interface Laureate {
  id?: string;
  knownName?: LocalizedText;
  fullName?: LocalizedText;
  orgName?: LocalizedText;
  birth?: { date?: string; year?: string };
  death?: { date?: string; year?: string };
  founded?: { date?: string };
  wikipedia?: { slug?: string; english?: string };
  links?: NobelLink[];
  nobelPrizes?: NobelPrizeEntry[];
}

// Short codes used by the Nobel API itself (…/nobelPrize/<code>/<year>).
const CATEGORY_CODE: Record<string, string> = {
  Physics: "phy",
  Chemistry: "che",
  "Physiology or Medicine": "med",
  Literature: "lit",
  Peace: "pea",
  "Economic Sciences": "eco",
};

// Categories that make someone a "scientist" for grouping purposes.
const SCIENCE_CATEGORIES = new Set<string>([
  "Physics",
  "Chemistry",
  "Physiology or Medicine",
  "Economic Sciences",
]);

// Map each Nobel science category to Citizen Science category slugs. Only the
// science categories map; Literature/Peace/Economics intentionally map to none.
const RELATED_BY_CATEGORY: Record<string, (typeof CATEGORY_SLUGS)[number][]> = {
  Physics: ["physics"],
  Chemistry: ["chemistry"],
  "Physiology or Medicine": ["human-health"],
};

// Proper, human-readable name of each prize for prose/contributions.
function prizeLabel(category: string): string {
  switch (category) {
    case "Peace":
      return "Nobel Peace Prize";
    case "Economic Sciences":
      return "Nobel Memorial Prize in Economic Sciences";
    default:
      return `Nobel Prize in ${category}`;
  }
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A few Nobel known-names slugify differently from the hand-authored frontend
// "great mind" / "living mind" pages (middle initials). Map them onto the
// canonical slug so the badge attaches to the curated page instead of creating
// a duplicate row.
const SLUG_ALIASES: Record<string, string> = {
  "jennifer-a-doudna": "jennifer-doudna",
  "richard-p-feynman": "richard-feynman",
};

function canonicalSlug(name: string): string {
  const base = slugify(name);
  return SLUG_ALIASES[base] ?? base;
}

function yearOf(d?: { date?: string; year?: string }): string | null {
  if (!d) return null;
  if (d.year && /^\d{4}$/.test(d.year)) return d.year;
  const m = d.date?.match(/^(\d{4})/);
  return m ? m[1] : null;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Trim a trailing period so we can append our own punctuation cleanly.
function trimDot(s: string): string {
  return s.replace(/\s*\.\s*$/, "").trim();
}

interface MappedProfile {
  slug: string;
  name: string;
  group: ProfileGroup;
  field: string;
  era: string;
  summary: string;
  contributions: string[];
  relatedCategorySlugs: string[];
  sources: ProfileSource[];
  nobelPrizes: ProfileNobelPrize[];
  wikiSlug: string | null;
}

function mapLaureate(l: Laureate): MappedProfile | null {
  const isOrg = Boolean(l.orgName?.en);
  const name = (isOrg ? l.orgName?.en : l.knownName?.en ?? l.fullName?.en)?.trim();
  const prizes = (l.nobelPrizes ?? []).filter((p) => p.category?.en);
  if (!name || prizes.length === 0) return null;

  const slug = canonicalSlug(name);

  const nobelPrizes: ProfileNobelPrize[] = prizes.map((p) => {
    const category = p.category?.en ?? "";
    return {
      category,
      categoryCode: CATEGORY_CODE[category] ?? "",
      awardYear: p.awardYear ?? "",
      motivation: (p.motivation?.en ?? "").trim(),
      portion: p.portion ?? "",
    };
  });

  // field = distinct categories joined with " & " (most laureates have one).
  const distinctCategories = Array.from(
    new Set(nobelPrizes.map((p) => p.category)),
  );
  const field = distinctCategories.join(" & ");

  // group
  let group: ProfileGroup;
  if (isOrg) {
    group = "organization";
  } else if (distinctCategories.some((c) => SCIENCE_CATEGORIES.has(c))) {
    group = "scientist";
  } else {
    group = "thought_leader";
  }

  // era
  let era: string;
  if (isOrg) {
    const founded = yearOf(l.founded);
    era = founded ? `Est. ${founded}` : "Organization";
  } else {
    const birth = yearOf(l.birth);
    const death = yearOf(l.death);
    if (birth && death) era = `${birth}–${death}`;
    else if (birth) era = `b. ${birth}`;
    else era = nobelPrizes[0]?.awardYear
      ? `Laureate ${nobelPrizes[0].awardYear}`
      : "Nobel laureate";
  }

  // summary + contributions from motivations
  const prizeSentences = nobelPrizes.map((p) => {
    const motivation = trimDot(p.motivation);
    const base = `the ${prizeLabel(p.category)} in ${p.awardYear}`;
    return motivation ? `${base} ${motivation}` : base;
  });
  const lead = isOrg
    ? `${name} is an organization honored with the Nobel Peace Prize.`
    : `${name} was awarded ${prizeSentences.join("; and ")}.`;
  const summary = isOrg
    ? `${lead} ${prizeSentences
        .map((s) => `It received ${trimDot(s)}.`)
        .join(" ")}`.trim()
    : lead;

  const contributions = nobelPrizes.map((p) => {
    const motivation = trimDot(p.motivation);
    const head = `${prizeLabel(p.category)} (${p.awardYear})`;
    return motivation ? `${head}: ${capitalize(motivation)}.` : head;
  });

  // relatedCategorySlugs (science categories only)
  const relatedCategorySlugs = Array.from(
    new Set(
      distinctCategories.flatMap((c) => RELATED_BY_CATEGORY[c] ?? []),
    ),
  );

  // sources: Nobel laureate page + Wikipedia article
  const sources: ProfileSource[] = [];
  const nobelLink =
    l.links?.find((x) => x.rel === "external" && x.href?.includes("nobelprize.org/"))
      ?.href ?? (l.id ? `https://www.nobelprize.org/laureate/${l.id}` : null);
  if (nobelLink) sources.push({ title: "NobelPrize.org", url: nobelLink });
  if (l.wikipedia?.english)
    sources.push({ title: "Wikipedia", url: l.wikipedia.english });

  return {
    slug,
    name,
    group,
    field,
    era,
    summary,
    contributions,
    relatedCategorySlugs,
    sources,
    nobelPrizes,
    wikiSlug: l.wikipedia?.slug ?? null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "CitizenScienceSeed/1.0 (educational directory seeding)",
          Accept: "application/json",
        },
      });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      if (attempt >= retries) throw err;
      await sleep(1000 * (attempt + 1));
    }
  }
}

// Fetch a portrait image URL from Wikipedia's REST summary endpoint.
async function fetchPortrait(wikiSlug: string | null): Promise<string | null> {
  if (!wikiSlug) return null;
  try {
    const data = await fetchJson<{
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
      type?: string;
    }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        wikiSlug,
      )}`,
      1,
    );
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source ?? data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchAllLaureates(): Promise<Laureate[]> {
  const all: Laureate[] = [];
  let offset = 0;
  for (;;) {
    const page = await fetchJson<{ laureates?: Laureate[] }>(
      `${NOBEL_API}?limit=${PAGE_SIZE}&offset=${offset}`,
    );
    const batch = page.laureates ?? [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    await sleep(300);
  }
  return all;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const limit = arg ? Number.parseInt(arg, 10) : NaN;
  const refreshPrizes = process.env.REFRESH_PRIZES === "1";

  console.log("Fetching all Nobel laureates from the Nobel Prize API...");
  let laureates = await fetchAllLaureates();
  console.log(`Fetched ${laureates.length} laureate records.`);
  if (Number.isFinite(limit)) laureates = laureates.slice(0, limit);

  // Load existing slugs once so we know which laureates are new (full insert)
  // vs. already present (badge-only update — never clobber curated content).
  const existingRows = await db
    .select({ slug: featuredProfilesTable.slug })
    .from(featuredProfilesTable);
  const existing = new Set(existingRows.map((r) => r.slug));

  const seenThisRun = new Set<string>();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let i = 0;

  for (const laureate of laureates) {
    i += 1;
    const mapped = mapLaureate(laureate);
    if (!mapped) {
      failed += 1;
      continue;
    }
    if (seenThisRun.has(mapped.slug)) {
      // Two distinct laureates that slugify to the same value — rare. Keep the
      // first; skip the duplicate so we never clobber it.
      skipped += 1;
      continue;
    }
    seenThisRun.add(mapped.slug);

    try {
      if (existing.has(mapped.slug)) {
        // Collision with an existing row: ONLY refresh the Nobel badge data so
        // hand-authored / previously-researched content is never overwritten.
        const set: Record<string, unknown> = {
          nobelPrizes: mapped.nobelPrizes,
          updatedAt: new Date(),
        };
        if (refreshPrizes) {
          const imageUrl = await fetchPortrait(mapped.wikiSlug);
          if (imageUrl) set.imageUrl = imageUrl;
        }
        await db
          .update(featuredProfilesTable)
          .set(set)
          .where(sql`${featuredProfilesTable.slug} = ${mapped.slug}`);
        updated += 1;
        console.log(`[${i}/${laureates.length}] update (badge): ${mapped.name}`);
      } else {
        const imageUrl = await fetchPortrait(mapped.wikiSlug);
        await db.insert(featuredProfilesTable).values({
          slug: mapped.slug,
          name: mapped.name,
          group: mapped.group,
          field: mapped.field,
          era: mapped.era,
          summary: mapped.summary,
          contributions: mapped.contributions,
          quotes: [],
          imageUrl,
          relatedCategorySlugs: mapped.relatedCategorySlugs,
          sources: mapped.sources,
          patents: [],
          nobelPrizes: mapped.nobelPrizes,
        });
        existing.add(mapped.slug);
        inserted += 1;
        console.log(
          `[${i}/${laureates.length}] insert [${mapped.group}]${
            imageUrl ? "" : " (no portrait)"
          }: ${mapped.name}`,
        );
      }
    } catch (err) {
      failed += 1;
      console.error(
        `[${i}/${laureates.length}] ERROR: ${mapped.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log(
    `Done. inserted=${inserted} updated=${updated} skipped=${skipped} failed=${failed}`,
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

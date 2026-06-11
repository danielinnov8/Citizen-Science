/**
 * Seed cinematic "great mind" STORY content for the Citizen Science directory.
 *
 * Task #44 made the cinematic `/directory/:slug` layout scale beyond the eight
 * hand-authored figures in the frontend (`greatMinds.ts`). This script is the
 * repeatable, DB-backed half of that mechanism: for each curated deceased
 * historical figure it uses the grounded Gemini research helper (Google Search)
 * to fetch rich long-form story content — tagline, lifespan, birthplace, a
 * multi-paragraph biography, a life timeline, titled contribution cards,
 * notable quotes, legacy reflections, and "did you know" facts — captures the
 * web source citations from grounding, pulls a portrait from Wikipedia, and
 * upserts the row into `featured_profiles` (keyed by slug).
 *
 * The per-person visual theme is intentionally LEFT NULL: the frontend derives
 * a sensible palette from the figure's `field` (`deriveStoryTheme`), so the DB
 * never has to carry styling. Storing a `storyTheme` is only an optional
 * override.
 *
 * Idempotent and RESUMABLE: by default a figure whose `biography` is already
 * populated is skipped, so a partial run interrupted by API rate limits can be
 * re-run to continue. A base row that already exists (e.g. from seed-profiles)
 * but lacks story content is ENRICHED in place. The Gemini free tier caps
 * grounded requests heavily (~per-minute and per-day), so seeding the full list
 * takes multiple passes / a paid key — pacing and 429 back-off are built in.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-stories             # seed everyone (resumable)
 *   pnpm --filter @workspace/scripts run seed-stories -- 10       # first 10 only
 *   FORCE=1 pnpm --filter @workspace/scripts run seed-stories     # re-research existing stories
 *   PACE_MS=2000 pnpm --filter @workspace/scripts run seed-stories # faster pacing (paid key)
 */
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  type ProfileSource,
  type ProfileGroup,
  type ProfileTimelineEntry,
  type ProfileStoryContribution,
} from "@workspace/db";
import { researchWithSearch } from "@workspace/integrations-gemini-ai-server";

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

interface Person {
  name: string;
  group: ProfileGroup;
}

// Curated deceased historical figures whose stories scale the cinematic layout
// beyond the hand-authored / static frontend batch. Editable: append names to
// grow the directory. Slugs that already ship a hand-authored frontend story
// (Einstein, Curie, Tesla, Darwin, Newton, Galileo, Lovelace, Turing) are
// intentionally omitted here — the frontend story always wins for those.
const HISTORICAL_FIGURES: Person[] = [
  { name: "Archimedes", group: "scientist" },
  { name: "Nicolaus Copernicus", group: "scientist" },
  { name: "Johannes Kepler", group: "scientist" },
  { name: "Gregor Mendel", group: "scientist" },
  { name: "James Clerk Maxwell", group: "scientist" },
  { name: "Dmitri Mendeleev", group: "scientist" },
  { name: "Max Planck", group: "scientist" },
  { name: "Erwin Schrödinger", group: "scientist" },
  { name: "Werner Heisenberg", group: "scientist" },
  { name: "Paul Dirac", group: "scientist" },
  { name: "Enrico Fermi", group: "scientist" },
  { name: "Wolfgang Pauli", group: "scientist" },
  { name: "Emmy Noether", group: "scientist" },
  { name: "Lise Meitner", group: "scientist" },
  { name: "Subrahmanyan Chandrasekhar", group: "scientist" },
  { name: "Edwin Hubble", group: "scientist" },
  { name: "Dorothy Hodgkin", group: "scientist" },
  { name: "Barbara McClintock", group: "scientist" },
  { name: "Alexander Fleming", group: "scientist" },
  { name: "Jonas Salk", group: "scientist" },
  { name: "Edward Jenner", group: "scientist" },
  { name: "Carl Linnaeus", group: "scientist" },
  { name: "Antonie van Leeuwenhoek", group: "scientist" },
  { name: "Carl Sagan", group: "thought_leader" },
  { name: "John von Neumann", group: "scientist" },
  { name: "Claude Shannon", group: "scientist" },
  { name: "Thomas Edison", group: "inventor" },
  { name: "Alexander Graham Bell", group: "inventor" },
  { name: "George Washington Carver", group: "inventor" },
  { name: "Chien-Shiung Wu", group: "scientist" },
  { name: "Vera Rubin", group: "scientist" },
  { name: "Katherine Johnson", group: "scientist" },
  // ---- Top-100 deceased-scientist roster (Task #93) ----
  // Every canonical roster figure not already present above and not among the
  // eight hand-authored frontend stories (Einstein, Curie, Tesla, Darwin,
  // Newton, Galileo, Lovelace, Turing). A handful here (Hawking, Feynman,
  // Faraday, Pasteur, Pauling, Bohr, Franklin) also have a static frontend
  // story that wins on the profile page, but they still need a DB row to appear
  // on the DB-backed /directory index.
  { name: "Louis Pasteur", group: "scientist" },
  { name: "Michael Faraday", group: "scientist" },
  { name: "Niels Bohr", group: "scientist" },
  { name: "Carl Friedrich Gauss", group: "scientist" },
  { name: "Antoine Lavoisier", group: "scientist" },
  { name: "Ernest Rutherford", group: "scientist" },
  { name: "Leonhard Euler", group: "scientist" },
  { name: "Richard Feynman", group: "scientist" },
  { name: "Aristotle", group: "scientist" },
  { name: "Gottfried Wilhelm Leibniz", group: "scientist" },
  { name: "Ludwig Boltzmann", group: "scientist" },
  { name: "J. J. Thomson", group: "scientist" },
  { name: "Robert Boyle", group: "scientist" },
  { name: "Robert Hooke", group: "scientist" },
  { name: "Christiaan Huygens", group: "scientist" },
  { name: "William Harvey", group: "scientist" },
  { name: "Pierre-Simon Laplace", group: "scientist" },
  { name: "Joseph-Louis Lagrange", group: "scientist" },
  { name: "Bernhard Riemann", group: "scientist" },
  { name: "Henri Poincaré", group: "scientist" },
  { name: "David Hilbert", group: "scientist" },
  { name: "Kurt Gödel", group: "scientist" },
  { name: "Georg Cantor", group: "scientist" },
  { name: "Blaise Pascal", group: "scientist" },
  { name: "Pierre de Fermat", group: "scientist" },
  { name: "Tycho Brahe", group: "scientist" },
  { name: "Stephen Hawking", group: "scientist" },
  { name: "Max Born", group: "scientist" },
  { name: "Wilhelm Röntgen", group: "scientist" },
  { name: "Henri Becquerel", group: "scientist" },
  { name: "Heinrich Hertz", group: "scientist" },
  { name: "Lord Kelvin", group: "scientist" },
  { name: "Hermann von Helmholtz", group: "scientist" },
  { name: "André-Marie Ampère", group: "scientist" },
  { name: "Georg Ohm", group: "scientist" },
  { name: "John Dalton", group: "scientist" },
  { name: "Amedeo Avogadro", group: "scientist" },
  { name: "Linus Pauling", group: "scientist" },
  { name: "Svante Arrhenius", group: "scientist" },
  { name: "Friedrich Wöhler", group: "scientist" },
  { name: "Justus von Liebig", group: "scientist" },
  { name: "Humphry Davy", group: "scientist" },
  { name: "Joseph Priestley", group: "scientist" },
  { name: "Robert Koch", group: "scientist" },
  { name: "Joseph Lister", group: "scientist" },
  { name: "Santiago Ramón y Cajal", group: "scientist" },
  { name: "Ivan Pavlov", group: "scientist" },
  { name: "Francis Crick", group: "scientist" },
  { name: "Rosalind Franklin", group: "scientist" },
  { name: "Norman Borlaug", group: "scientist" },
  { name: "Alexander von Humboldt", group: "scientist" },
  { name: "Murray Gell-Mann", group: "scientist" },
  { name: "John Bardeen", group: "scientist" },
  { name: "Hideki Yukawa", group: "scientist" },
  { name: "Satyendra Nath Bose", group: "scientist" },
  { name: "C. V. Raman", group: "scientist" },
  { name: "Maria Goeppert Mayer", group: "scientist" },
  { name: "Arthur Eddington", group: "scientist" },
  { name: "George Gamow", group: "scientist" },
  { name: "Freeman Dyson", group: "scientist" },
  { name: "Ibn al-Haytham", group: "scientist" },
  { name: "Avicenna", group: "scientist" },
  { name: "Hypatia", group: "scientist" },
  { name: "Caroline Herschel", group: "scientist" },
  { name: "William Herschel", group: "scientist" },
  { name: "Euclid", group: "scientist" },
];

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Coerce an unknown array into well-formed timeline entries.
function asTimeline(value: unknown, max: number): ProfileTimelineEntry[] {
  if (!Array.isArray(value)) return [];
  const out: ProfileTimelineEntry[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const year = asString(obj.year);
    const title = asString(obj.title);
    const detail = asString(obj.detail);
    if (!year && !title && !detail) continue;
    out.push({ year, title, detail });
    if (out.length >= max) break;
  }
  return out;
}

// Coerce an unknown array into well-formed contribution cards.
function asContributions(
  value: unknown,
  max: number,
): ProfileStoryContribution[] {
  if (!Array.isArray(value)) return [];
  const out: ProfileStoryContribution[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const title = asString(obj.title);
    const detail = asString(obj.detail);
    if (!title && !detail) continue;
    out.push({ title, detail });
    if (out.length >= max) break;
  }
  return out;
}

// Pull a JSON object out of a possibly fenced / prose-wrapped model reply.
function parseJsonObject(text: string): Record<string, unknown> | null {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

const STORY_PROMPT = (name: string) =>
  `Research the deceased historical figure in science/invention "${name}" using up-to-date, factual web sources, and write rich, accurate, encyclopedic content for a cinematic profile page. This person is no longer living — include their full lifespan (birth–death years).

Respond with ONLY a single JSON object (no markdown, no prose) with exactly these keys:
{
  "field": "primary field, e.g. Physics, Astronomy, Genetics, Chemistry",
  "era": "short label for their period, e.g. \\"Scientific Revolution\\", \\"20th-Century Physics\\"",
  "lifespan": "birth and death years as \\"1879 – 1955\\"",
  "birthplace": "city, country of birth (modern name acceptable)",
  "tagline": "one vivid sentence (max ~20 words) capturing why they matter",
  "summary": "2-3 sentence plain-text overview of who they were and why they matter",
  "biography": ["2-4 paragraphs, each a plain-text string of 2-4 sentences, narrating their life and work"],
  "timeline": [{"year": "1905", "title": "short event title", "detail": "one sentence"}],
  "contributions": [{"title": "short title", "detail": "one-sentence explanation"}],
  "quotes": ["0-3 short, accurately attributed direct quotes; empty array if none are well-documented"],
  "legacy": ["1-2 plain-text sentences on their lasting impact"],
  "didYouKnow": ["2-4 short, surprising but accurate facts"],
  "relatedCategorySlugs": ["1-3 slugs picked ONLY from the allowed list that best match their work"]
}

Provide 4-6 timeline entries (chronological) and 3-4 contributions.
Allowed relatedCategorySlugs values: ${CATEGORY_SLUGS.join(", ")}.

Only state facts you can support from the sources. Do not invent quotes or dates.`;

// The Gemini free tier allows ~5 requests/min. On a 429 the API tells us how
// long to wait via retryDelay; honour it (with a sane floor/ceiling) and retry.
async function researchWithRetry(
  name: string,
  maxRetries = 2,
): Promise<{ text: string; sources: ProfileSource[] }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await researchWithSearch(STORY_PROMPT(name), {
        maxOutputTokens: 4096,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const is429 =
        message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
      const isTransient =
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("500") ||
        message.includes("overloaded");
      if ((!is429 && !isTransient) || attempt >= maxRetries) throw err;
      const match = message.match(/"retryDelay":\s*"(\d+)s"/);
      const fallback = is429 ? 20 : 8;
      const waitMs = Math.min(
        30_000,
        Math.max(
          isTransient && !is429 ? 8_000 : 12_000,
          (match ? Number(match[1]) : fallback) * 1000 + 1000,
        ),
      );
      console.log(
        `  retrying ${name} (${is429 ? "429" : "transient"}); waiting ${Math.round(waitMs / 1000)}s...`,
      );
      await sleep(waitMs);
    }
  }
}

interface ResearchedStory {
  field: string;
  era: string;
  lifespan: string;
  birthplace: string;
  tagline: string;
  summary: string;
  biography: string[];
  timeline: ProfileTimelineEntry[];
  storyContributions: ProfileStoryContribution[];
  quotes: string[];
  legacy: string[];
  didYouKnow: string[];
  relatedCategorySlugs: string[];
}

async function research(
  name: string,
): Promise<{ story: ResearchedStory; sources: ProfileSource[] } | null> {
  const { text, sources } = await researchWithRetry(name);
  const parsed = parseJsonObject(text);
  if (!parsed) return null;

  const field = asString(parsed.field);
  const era = asString(parsed.era);
  const biography = asStringArray(parsed.biography, 4);
  // A story page needs at minimum a field, an era, and a real biography.
  if (!field || !era || biography.length === 0) return null;

  const related = asStringArray(parsed.relatedCategorySlugs, 3).filter(
    (s): s is (typeof CATEGORY_SLUGS)[number] =>
      (CATEGORY_SLUGS as readonly string[]).includes(s),
  );

  const summary = asString(parsed.summary) || biography[0];

  return {
    story: {
      field,
      era,
      lifespan: asString(parsed.lifespan),
      birthplace: asString(parsed.birthplace),
      tagline: asString(parsed.tagline),
      summary,
      biography,
      timeline: asTimeline(parsed.timeline, 8),
      storyContributions: asContributions(parsed.contributions, 6),
      quotes: asStringArray(parsed.quotes, 3),
      legacy: asStringArray(parsed.legacy, 3),
      didYouKnow: asStringArray(parsed.didYouKnow, 4),
      relatedCategorySlugs: related,
    },
    sources: sources.slice(0, 8),
  };
}

// Fetch a portrait image URL from Wikipedia's REST summary endpoint.
async function fetchPortrait(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        name,
      )}`,
      {
        headers: {
          "User-Agent":
            "CitizenScienceSeed/1.0 (educational directory seeding)",
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
      type?: string;
    };
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source ?? data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function seedOne(person: Person, force: boolean): Promise<string> {
  const { name, group } = person;
  const slug = slugify(name);

  if (!force) {
    const [existing] = await db
      .select({ biography: featuredProfilesTable.biography })
      .from(featuredProfilesTable)
      .where(sql`${featuredProfilesTable.slug} = ${slug}`);
    if (existing && existing.biography.length > 0) {
      return `skip (story exists): ${name}`;
    }
  }

  const researched = await research(name);
  if (!researched) return `FAIL (no usable research): ${name}`;
  const { story, sources } = researched;

  const imageUrl = await fetchPortrait(name);

  // contributions[] (the flat string[] used by the standard layout) is derived
  // from the story cards so the row reads correctly in both layouts.
  const flatContributions = story.storyContributions
    .map((c) => (c.title ? `${c.title}: ${c.detail}` : c.detail))
    .filter(Boolean);

  const values = {
    slug,
    name,
    group,
    field: story.field,
    era: story.era,
    summary: story.summary,
    contributions: flatContributions,
    quotes: story.quotes,
    imageUrl,
    relatedCategorySlugs: story.relatedCategorySlugs,
    sources,
    // Story columns:
    tagline: story.tagline || null,
    lifespan: story.lifespan || null,
    birthplace: story.birthplace || null,
    biography: story.biography,
    timeline: story.timeline,
    storyContributions: story.storyContributions,
    legacy: story.legacy,
    didYouKnow: story.didYouKnow,
    // Theme intentionally left null — the frontend derives it from `field`.
  };

  await db
    .insert(featuredProfilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: featuredProfilesTable.slug,
      set: {
        name: values.name,
        group: values.group,
        field: values.field,
        era: values.era,
        summary: values.summary,
        contributions: values.contributions,
        quotes: values.quotes,
        imageUrl: values.imageUrl,
        relatedCategorySlugs: values.relatedCategorySlugs,
        sources: values.sources,
        tagline: values.tagline,
        lifespan: values.lifespan,
        birthplace: values.birthplace,
        biography: values.biography,
        timeline: values.timeline,
        storyContributions: values.storyContributions,
        legacy: values.legacy,
        didYouKnow: values.didYouKnow,
        updatedAt: new Date(),
      },
    });

  return `ok [${group}]${imageUrl ? "" : " (no portrait)"}: ${name}`;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const limit = arg ? Number.parseInt(arg, 10) : NaN;
  const force = process.env.FORCE === "1";

  let people = HISTORICAL_FIGURES;
  if (Number.isFinite(limit)) {
    people = people.slice(0, limit);
  }

  console.log(
    `Seeding ${people.length} story profiles (serial pacing${force ? ", force" : ""})...`,
  );

  // The free tier allows ~5 requests/min, so pace research calls ~12s apart to
  // mostly avoid 429s (researchWithRetry backs off when we still hit one). On a
  // paid key the per-minute limit is far higher, so PACE_MS can be lowered via
  // env (e.g. PACE_MS=2000) to finish the full list in fewer passes.
  const PACE_MS = Number.isFinite(Number(process.env.PACE_MS))
    ? Number(process.env.PACE_MS)
    : 12_500;

  let done = 0;
  for (const person of people) {
    let madeApiCall = true;
    try {
      const result = await seedOne(person, force);
      madeApiCall = !result.startsWith("skip");
      done += 1;
      console.log(`[${done}/${people.length}] ${result}`);
    } catch (err) {
      done += 1;
      console.error(
        `[${done}/${people.length}] ERROR: ${person.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
    if (madeApiCall && done < people.length) await sleep(PACE_MS);
  }

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

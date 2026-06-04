/**
 * One-time seed for the Citizen Science "Scientists & Inventors" directory.
 *
 * For each curated person it uses the grounded Gemini research helper
 * (Google Search) to fetch a short bio, field, era, key contributions, notable
 * quotes, and relevant Citizen Science category slugs — capturing the web
 * source citations from grounding — then pulls a portrait from Wikipedia and
 * upserts the record into the `featured_profiles` table.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-profiles            # seed everyone
 *   pnpm --filter @workspace/scripts run seed-profiles -- 10      # first 10 only
 *   FORCE=1 pnpm --filter @workspace/scripts run seed-profiles    # re-research existing
 */
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  type ProfileSource,
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

// Curated list of ~100 notable scientists and inventors across many fields.
const PEOPLE: string[] = [
  "Albert Einstein",
  "Isaac Newton",
  "Marie Curie",
  "Charles Darwin",
  "Galileo Galilei",
  "Nikola Tesla",
  "Thomas Edison",
  "Louis Pasteur",
  "Michael Faraday",
  "Niels Bohr",
  "Max Planck",
  "Erwin Schrödinger",
  "Werner Heisenberg",
  "Richard Feynman",
  "Stephen Hawking",
  "Carl Sagan",
  "Edwin Hubble",
  "Johannes Kepler",
  "Nicolaus Copernicus",
  "Tycho Brahe",
  "Caroline Herschel",
  "Annie Jump Cannon",
  "Henrietta Swan Leavitt",
  "Cecilia Payne-Gaposchkin",
  "Subrahmanyan Chandrasekhar",
  "Vera Rubin",
  "Jocelyn Bell Burnell",
  "Katherine Johnson",
  "Dmitri Mendeleev",
  "Antoine Lavoisier",
  "Robert Boyle",
  "John Dalton",
  "Linus Pauling",
  "Rosalind Franklin",
  "Dorothy Hodgkin",
  "Fritz Haber",
  "Glenn Seaborg",
  "Ahmed Zewail",
  "Gregor Mendel",
  "James Watson",
  "Francis Crick",
  "Barbara McClintock",
  "Lynn Margulis",
  "Rachel Carson",
  "Jane Goodall",
  "E. O. Wilson",
  "Alexander von Humboldt",
  "Carl Linnaeus",
  "Alfred Russel Wallace",
  "Antonie van Leeuwenhoek",
  "Robert Koch",
  "Alexander Fleming",
  "Jonas Salk",
  "Edward Jenner",
  "Florence Nightingale",
  "Elizabeth Blackwell",
  "Virginia Apgar",
  "Gertrude Elion",
  "Frances Kelsey",
  "Tu Youyou",
  "Santiago Ramón y Cajal",
  "Rita Levi-Montalcini",
  "Camillo Golgi",
  "Eric Kandel",
  "Ivan Pavlov",
  "Norman Borlaug",
  "George Washington Carver",
  "Wangari Maathai",
  "Luther Burbank",
  "Justus von Liebig",
  "Svante Arrhenius",
  "Charles David Keeling",
  "James Lovelock",
  "Syukuro Manabe",
  "Joanne Simpson",
  "Alfred Wegener",
  "Inge Lehmann",
  "Marie Tharp",
  "Ada Lovelace",
  "Alan Turing",
  "Charles Babbage",
  "Grace Hopper",
  "John von Neumann",
  "Claude Shannon",
  "Tim Berners-Lee",
  "Hedy Lamarr",
  "Guglielmo Marconi",
  "Alexander Graham Bell",
  "Samuel Morse",
  "James Clerk Maxwell",
  "Heinrich Hertz",
  "Lord Kelvin",
  "Wilhelm Röntgen",
  "Ernest Rutherford",
  "Enrico Fermi",
  "Lise Meitner",
  "Chien-Shiung Wu",
  "Emmy Noether",
  "Katsuko Saruhashi",
  "Mario Molina",
  "Stephanie Kwolek",
  "Percy Lavon Julian",
  "Charles Goodyear",
  "Willis Carrier",
  "Garrett Morgan",
  "Granville Woods",
  "Leonardo da Vinci",
  "Peter Diamandis",
  "Salim Ismail",
  "Dave Blundin",
  "Alexander Wissner-Gross",
];

interface ResearchedProfile {
  field: string;
  era: string;
  summary: string;
  contributions: string[];
  quotes: string[];
  relatedCategorySlugs: string[];
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
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

const RESEARCH_PROMPT = (name: string) => `Research the scientist or inventor "${name}" using up-to-date, factual web sources.

Respond with ONLY a single JSON object (no markdown, no prose) with exactly these keys:
{
  "field": "primary field of work, e.g. Physics, Chemistry, Biology, Astronomy",
  "era": "the period they were active, e.g. \\"1879–1955\\" or \\"20th century\\"",
  "summary": "2-4 sentence plain-text biography of who they are and why they matter",
  "contributions": ["3-6 short strings, each one key discovery, invention, or contribution"],
  "quotes": ["0-3 short, accurately attributed direct quotes; empty array if none are well-documented"],
  "relatedCategorySlugs": ["1-3 slugs picked ONLY from this list that best match their work"]
}

Allowed relatedCategorySlugs values: ${CATEGORY_SLUGS.join(", ")}.

Only state facts you can support from the sources. Do not invent quotes.`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The Gemini free tier allows ~5 requests/min. On a 429 the API tells us how
// long to wait via retryDelay; honour it (with a sane floor/ceiling) and retry.
async function researchWithRetry(
  name: string,
  maxRetries = 2,
): Promise<{ text: string; sources: ProfileSource[] }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await researchWithSearch(RESEARCH_PROMPT(name), {
        maxOutputTokens: 2048,
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

async function research(name: string): Promise<{
  profile: ResearchedProfile;
  sources: ProfileSource[];
} | null> {
  const { text, sources } = await researchWithRetry(name);
  const parsed = parseJsonObject(text);
  if (!parsed) return null;

  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const field = typeof parsed.field === "string" ? parsed.field.trim() : "";
  const era = typeof parsed.era === "string" ? parsed.era.trim() : "";
  if (!summary || !field || !era) return null;

  const related = asStringArray(parsed.relatedCategorySlugs, 3).filter(
    (s): s is (typeof CATEGORY_SLUGS)[number] =>
      (CATEGORY_SLUGS as readonly string[]).includes(s),
  );

  return {
    profile: {
      field,
      era,
      summary,
      contributions: asStringArray(parsed.contributions, 6),
      quotes: asStringArray(parsed.quotes, 3),
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

async function seedOne(name: string, force: boolean): Promise<string> {
  const slug = slugify(name);

  if (!force) {
    const [existing] = await db
      .select({ id: featuredProfilesTable.id })
      .from(featuredProfilesTable)
      .where(sql`${featuredProfilesTable.slug} = ${slug}`);
    if (existing) return `skip (exists): ${name}`;
  }

  const researched = await research(name);
  if (!researched) return `FAIL (no usable research): ${name}`;

  const imageUrl = await fetchPortrait(name);

  const values = {
    slug,
    name,
    field: researched.profile.field,
    era: researched.profile.era,
    summary: researched.profile.summary,
    contributions: researched.profile.contributions,
    quotes: researched.profile.quotes,
    imageUrl,
    relatedCategorySlugs: researched.profile.relatedCategorySlugs,
    sources: researched.sources,
  };

  await db
    .insert(featuredProfilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: featuredProfilesTable.slug,
      set: {
        name: values.name,
        field: values.field,
        era: values.era,
        summary: values.summary,
        contributions: values.contributions,
        quotes: values.quotes,
        imageUrl: values.imageUrl,
        relatedCategorySlugs: values.relatedCategorySlugs,
        sources: values.sources,
        updatedAt: new Date(),
      },
    });

  return `ok${imageUrl ? "" : " (no portrait)"}: ${name}`;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const limit = arg ? Number.parseInt(arg, 10) : NaN;
  const force = process.env.FORCE === "1";
  const people = Number.isFinite(limit) ? PEOPLE.slice(0, limit) : PEOPLE;

  console.log(
    `Seeding ${people.length} profiles (serial, ~12s pacing${force ? ", force" : ""})...`,
  );

  // The free tier allows ~5 requests/min, so pace research calls ~12s apart to
  // mostly avoid 429s (researchWithRetry backs off when we still hit one).
  // On a paid key the per-minute limit is far higher, so PACE_MS can be lowered
  // via env (e.g. PACE_MS=1500) to finish the full list in one pass.
  const PACE_MS = Number.isFinite(Number(process.env.PACE_MS))
    ? Number(process.env.PACE_MS)
    : 12_500;

  let done = 0;
  for (const name of people) {
    let madeApiCall = true;
    try {
      const result = await seedOne(name, force);
      madeApiCall = !result.startsWith("skip");
      done += 1;
      console.log(`[${done}/${people.length}] ${result}`);
    } catch (err) {
      done += 1;
      console.error(
        `[${done}/${people.length}] ERROR: ${name}:`,
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

// Authoritative server-side set of "living legend" directory slugs — the present-
// day scientists and inventors who can be mentored. These figures are authored as
// rich, database-independent story content in the citizen-science frontend
// (`src/lib/livingMinds.ts` → `LIVING_MIND_STORIES`); many are NOT seeded into the
// `featured_profiles` table, so the mentee waitlist keys on the directory slug and
// must NOT require a DB row to exist.
//
// This mirrors the frontend `LIVING_MIND_STORIES` keys — kept in lockstep so the
// directory's "Be mentored" CTA and the server's waitlist agree on who is a valid
// living legend. When adding a living legend to the frontend, add its slug here.
// (Living figures seeded into `featured_profiles` are also accepted independently,
// so DB-backed living profiles work even if not listed here.)
export const LIVING_LEGEND_SLUGS: ReadonlySet<string> = new Set([
  "elon-musk",
  "jeff-bezos",
  "jennifer-doudna",
  "tim-berners-lee",
  "demis-hassabis",
  "jensen-huang",
  "geoffrey-hinton",
  "fei-fei-li",
  "katalin-kariko",
  "carolyn-bertozzi",
  "sara-seager",
  "neil-degrasse-tyson",
  "jane-goodall",
  "peter-diamandis",
  "salim-ismail",
  "dave-blundin",
  "alexander-wissner-gross",
  "matthew-chase-levy",
  "amjad-masad",
  "laura-burkemper",
  "manu-rehani",
]);

export function isKnownLivingLegend(slug: string): boolean {
  return LIVING_LEGEND_SLUGS.has(slug);
}

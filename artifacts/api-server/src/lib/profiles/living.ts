// Heuristic for whether a featured profile is a LIVING member, derived from its
// free-text `era` string (the only lifespan signal stored on a profile). A
// historical figure carries a closed lifespan range like "1879–1955"; living
// members use an open form ("b. 1971", "Contemporary", "21st century", "since
// the 1990s"). So: a closed YYYY–YYYY range ⇒ historical, anything else ⇒ living.
//
// This mirrors the frontend `isLivingEra` in the citizen-science app — kept in
// lockstep so the directory's "Message" affordance and the server's hold logic
// agree on who can be messaged.
const CLOSED_LIFESPAN_RE = /\b\d{4}\s*[-–—]\s*\d{4}\b/;

export function isLivingEra(era: string | null | undefined): boolean {
  if (!era) return false;
  return !CLOSED_LIFESPAN_RE.test(era);
}

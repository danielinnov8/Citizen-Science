// Heuristic for whether a directory profile is a LIVING member, derived from its
// free-text `era` string (the only lifespan signal on a profile). Historical
// figures carry a closed lifespan range like "1879–1955"; living members use an
// open form ("b. 1971", "Contemporary", "21st century", "since the 1990s").
// So: a closed YYYY–YYYY range ⇒ historical, anything else ⇒ living.
//
// Mirrors the server-side `isLivingEra` in api-server — keep the two in lockstep
// so the "Message" affordance and the hold-on-send logic agree on who is living.
const CLOSED_LIFESPAN_RE = /\b\d{4}\s*[-–—]\s*\d{4}\b/;

export function isLivingEra(era: string | null | undefined): boolean {
  if (!era) return false;
  return !CLOSED_LIFESPAN_RE.test(era);
}

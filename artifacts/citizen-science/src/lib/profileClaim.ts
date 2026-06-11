// Living-innovator detection (Task #92), mirroring the server's
// `isLivingProfile` in api-server `lib/profiles/eligibility.ts`. Only living
// innovators may claim their own directory profile — historical/deceased
// figures must not be claimable.
//
// The living/historical signal lives in `era`: a closed four-digit year range
// (e.g. "1879–1955") denotes a death year → historical. Everything else
// ("b. 1971", "Contemporary", "21st century") denotes a living innovator. The
// authoritative check is server-side; this mirror lets us show the right
// affordance to logged-out visitors before the claim endpoint is reachable.
const CLOSED_YEAR_RANGE = /\b\d{4}\s*[–-]\s*\d{4}\b/;

export function isClaimableProfile(
  era: string | null | undefined,
  lifespan?: string | null,
): boolean {
  if (lifespan && CLOSED_YEAR_RANGE.test(lifespan)) return false;
  if (era && CLOSED_YEAR_RANGE.test(era)) return false;
  return true;
}

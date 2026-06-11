// Living-innovator detection (Task #92). Only living innovators may claim their
// own directory profile — historical/deceased figures (Einstein, Curie, …) must
// not be claimable.
//
// The DB's `lifespan` column is empty for every row; the living/historical
// signal actually lives in `era`. A closed four-digit year range (e.g.
// "1879–1955", "1934–2025") denotes someone with a death year → historical.
// Everything else ("b. 1971", "Contemporary", "21st century", "since the
// 1980s") denotes a living innovator. We also honor `lifespan` when present so
// the rule keeps working if that column is ever populated.
const CLOSED_YEAR_RANGE = /\b\d{4}\s*[–-]\s*\d{4}\b/;

export function isLivingProfile(
  era: string | null | undefined,
  lifespan?: string | null,
): boolean {
  // A populated lifespan with a closed range is the strongest deceased signal.
  if (lifespan && CLOSED_YEAR_RANGE.test(lifespan)) return false;
  if (era && CLOSED_YEAR_RANGE.test(era)) return false;
  return true;
}

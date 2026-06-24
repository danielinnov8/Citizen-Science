// Deterministic "simulated" engagement numbers for the challenges prototype.
//
// The data model has no upvote concept for challenges, and seeded solutions
// start with a real vote score of 0. To make the leaderboard read as an active
// community, we layer stable, deterministic simulated counts on top. Everything
// here is a pure function of an id/slug, so the numbers never jump between
// renders and any real user votes still add on top of the simulated base.

// FNV-1a — small, stable string hash so a given slug/id always maps to the
// same pseudo-random number.
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// The eight "hero" challenges that lead the leaderboard, in order. They get
// 108, 107, … 101 upvotes respectively so they always sit on top of the list.
const TOP_CHALLENGE_SLUGS = [
  "climate-change",
  "clean-energy-access",
  "pandemic-preparedness",
  "ocean-health",
  "food-security",
  "clean-water",
  "ai-safety",
  "antibiotic-resistance",
] as const;

/** Simulated upvote total for a challenge, used to rank the challenges list. */
export function simulatedChallengeUpvotes(slug: string): number {
  const topIndex = TOP_CHALLENGE_SLUGS.indexOf(slug as (typeof TOP_CHALLENGE_SLUGS)[number]);
  if (topIndex !== -1) {
    // 108, 107, … 101
    return 108 - topIndex;
  }
  // Everyone else gets a stable value well below the top tier (12…95).
  return 12 + (hashString(slug) % 84);
}

/**
 * Simulated "community" upvotes for a solution. Added to the real voteScore so
 * seeded solutions read as active. Real user votes still increment on top.
 */
export function simulatedSolutionVotes(solutionId: string): number {
  return 6 + (hashString(solutionId) % 84); // 6…89
}

/** Real voteScore plus the simulated base — the number shown to users. */
export function displaySolutionScore(solution: { id: string; voteScore: number }): number {
  return solution.voteScore + simulatedSolutionVotes(solution.id);
}

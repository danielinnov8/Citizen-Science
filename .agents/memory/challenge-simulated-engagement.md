---
name: Challenge & solution simulated engagement
description: Why the challenges list upvote numbers and solution vote scores are partly fabricated on the frontend, and how to keep them consistent.
---

# Challenge & solution simulated engagement

The challenges leaderboard upvote counts and the "extra" solution upvotes are
**frontend-only simulations**, not real data. There is no challenge-upvote table
in the DB, and seeded solutions start at a real `voteScore` of 0.

The source of truth is `artifacts/citizen-science/src/lib/challengeSim.ts`
(deterministic FNV-1a hash keyed by slug/id):
- `simulatedChallengeUpvotes(slug)` — a curated top-8 slug set gets exactly
  108..101 so it always leads; everyone else gets a stable value capped below
  that tier. The challenges list sorts by this.
- `displaySolutionScore(solution)` = real `voteScore` + `simulatedSolutionVotes(id)`.
  Every place that shows a solution score must use this, or the number jumps
  between pages.

**Why:** the prototype needed an active-looking leaderboard for a demo; building
a real challenge-vote backend was out of scope.

**How to apply:**
- The optimistic vote toggle mutates only the real `voteScore`, so the displayed
  total still moves correctly when a user votes — keep that split.
- Simulated solution counts are keyed by the DB-generated solution `id`, so the
  exact numbers differ across fresh databases. If cross-environment consistency
  ever matters, switch the key to something semantic (e.g. `challengeSlug +
  authorSlug/title`).
- If anyone asks "where do the challenge upvotes come from / why can't I find the
  votes table," this is the answer.

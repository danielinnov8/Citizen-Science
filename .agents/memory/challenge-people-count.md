---
name: Challenge "people working on it" count
description: How the people-count on challenges is defined and how living-figure contributors are modeled.
---

# Challenge people-count + contributor modeling

The "people working on it" tally on a challenge = formal `challenge_members` rows
**plus** `COUNT(DISTINCT author_slug)` over `challenge_solutions` where
`author_slug IS NOT NULL`. This must stay identical in BOTH the list endpoint
(`GET /api/challenges`) and the detail endpoint (`GET /api/challenges/:slug`) —
they drifted once (list counted members only) and looked inconsistent.

**Why no double-count:** user-submitted solutions are stored with
`author_slug: null` (they carry `userId` + the user's display name instead), so
they never enter the distinct-author count. Only curated/seeded contributions
set `author_slug`.

**Contributor convention:** notable real people are attached to a challenge by
seeding a `challenge_solutions` row with `userId: null`,
`authorSlug: <featured_profiles.slug>`, and `authorName`. The `authorSlug` MUST
match an existing `featured_profiles` slug so the author card deep-links to
`/directory/:slug` — verify the slug resolves before seeding. Living-figure
contributor seeds live in `seed/challenge-contributors.ts`; per-figure one-offs
(Elon, Manu) live in `seed/challenges.ts`. All are idempotent SELECT-then-insert
keyed on `(challengeSlug, authorSlug)` and chained at boot in `index.ts`.

**Known gap (not yet fixed):** there is no DB unique constraint on
`(challenge_slug, author_slug)`, so seeders are only app-level idempotent — two
instances booting concurrently on a fresh DB could double-insert. A partial
unique index + `onConflictDoNothing` would make it race-safe.

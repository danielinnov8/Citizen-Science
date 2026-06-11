---
name: Mentors list vs directory profiles bridge
description: Why living directory figures appear on /mentors as display-only cards, not enrollable mentors
---

The `/mentors` list and the `/directory` are two separate data models:

- `/mentors` (DB-backed): real `users` with `isMentor=true` + a `mentorProfiles` row. Cards link to `/mentors/:userId` and support enrollment, which moves credits mentee→mentor through the credit ledger (requires real user rows + credit accounts).
- `/directory` (featuredProfiles): slug-based `FeaturedProfile` rows. "Living" figures are the hand-authored set in `src/lib/livingMinds.ts` (`LIVING_MIND_STORIES`), rendered with the `LivingMindStory` layout. They are NOT real users.

**Rule:** living directory figures cannot be enrollable mentors. On `/mentors` they are rendered as display-only cards (sourced from `Object.values(LIVING_MIND_STORIES)`) that link to `/directory/:slug`, kept in a separate section from the DB-backed "Community mentors". The "Mentor Program" button in the `LivingMindStory` hero links to `/mentors`.

**Why:** enrollment + credit transfer need a real `users` row and credit account; famous living figures have neither. Faking user rows for them would break the ledger and auth assumptions.

**How to apply:** when extending the mentors feature, keep living-figure cards non-enrollable and route them to the directory; only DB mentor users get the `/mentors/:id` enroll flow.

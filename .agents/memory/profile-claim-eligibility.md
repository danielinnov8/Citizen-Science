---
name: Profile claim eligibility (living vs historical)
description: Living-innovator claim rule is duplicated client+server and must stay in lockstep; render precedence flips for owned profiles.
---

Only LIVING innovators may claim/edit their directory profile. The living vs
historical signal lives in the profile's `era` text (the `lifespan` column is
empty for every row): a closed four-digit year range like `1879–1955` means a
death year → historical/deceased → NOT claimable. Everything else (`b. 1971`,
`Contemporary`, `21st century`) → living → claimable.

**Rule is duplicated** in two places and must stay in lockstep:
- server: api-server `src/lib/profiles/eligibility.ts` `isLivingProfile(era, lifespan)` (authoritative — gates the claim endpoint)
- client: citizen-science `src/lib/profileClaim.ts` `isClaimableProfile(...)` (mirror — only used to show the right affordance to logged-out visitors before the auth-gated endpoint is reachable)

**Why:** the server is the source of truth, but a logged-out visitor can't hit
the auth-gated `/claim` endpoint, so the frontend needs its own copy to decide
whether to render the "Log in to claim" CTA. If the two regexes drift, guests
see a claim button for figures the server will reject.

**Render precedence gotcha:** in `ProfileDetail.tsx`, a `verified` (owned)
profile SKIPS the hand-authored GreatMindStory / LivingMindStory layouts so the
owner's DB-stored edits become authoritative (falls through to the DB-built
story or the standard layout). Forgetting this makes owner edits invisible
because the hand-authored content would otherwise win.

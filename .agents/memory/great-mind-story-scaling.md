---
name: Great-mind story scaling
description: How the citizen-science cinematic /directory/:slug "great mind" pages scale beyond hand-authored figures, and why content is DB-decoupled.
---

# Great-mind story scaling (citizen-science)

The cinematic `/directory/:slug` figure page must render real content for many
historical figures, not just a small hand-authored set, AND must still render
when the API/DB is unavailable.

## The mechanism (three render tiers, in precedence order)
1. Hand-authored frontend story (premium, bespoke palette) — wins on slug.
2. A static `CURATED_HISTORICAL` batch registered into `GREAT_MIND_STORIES` at
   module load, themed via `deriveStoryTheme(field)` — renders WITHOUT the DB.
3. A DB row turned into a story via `buildStoryFromProfile(profile)` — used when
   the figure isn't in code but a `featured_profiles` row has a biography.
Falls back to the standard profile layout when none apply.

## Key decisions
- **`storyTheme` is left NULL in the DB.** The frontend derives a per-field
  default palette from `deriveStoryTheme(field)` (a discipline→theme keyword
  map). Storing a theme is only an optional override.
  **Why:** keeps styling out of the data layer, so a seeder never has to make
  visual choices and every new figure looks intentional for free.
- **Content is decoupled from the DB.** Pages render from frontend data even
  when the api-server is down (verified: /directory/stephen-hawking renders with
  api-server stopped; only the DB-only figures need the backend).
- **Graceful partial rendering.** Hero tagline/lifespan/birthplace, portrait,
  and contribution titles are all conditional — a sparse row still looks clean.

## How to apply
- To add figures without a DB: append to `CURATED_HISTORICAL` in
  `artifacts/citizen-science/src/lib/greatMinds.ts` (omit `theme`; it's filled
  from `field` on registration).
- To mass-populate: `pnpm --filter @workspace/scripts run seed-stories`
  (grounded-Gemini, idempotent/resumable; skips rows whose biography is already
  populated, enriches base rows in place). Gemini free tier ~20 grounded req/DAY
  caps bulk runs — needs multiple passes or a paid key.
- DB schema lives in `lib/db/src/schema/featuredProfiles.ts`, mirrored in
  `lib/api-spec/openapi.yaml` (rerun api-spec codegen after schema changes).

---
name: Profile footstep / renderer triplication
description: Profile "Follow in Their Footsteps" experiment selection is duplicated across three renderers — change them together.
---

# Profile renderers come in three

A directory profile (`/directory/:slug`) renders through ONE of three code paths,
chosen in `ProfileDetail.tsx` precedence order:
1. hand-authored historical → `GreatMindStory`
2. hand-authored living → `LivingMindStory`
3. DB-built (from `buildStoryFromProfile`) → `GreatMindStory`
4. fallback standard layout → inline in `ProfileDetail.tsx`

**Rule:** anything that affects a profile section shared by all paths — the
"Follow in Their Footsteps" experiment list, the claim/message surface, etc. —
must be applied to GreatMindStory, LivingMindStory, AND the ProfileDetail
fallback, or it silently diverges per figure. Prefer one self-contained shared
component (e.g. `ProfileClaimCard` owns its own claim-status query + dialogs)
dropped into all three paths over re-implementing per renderer. A figure with a
populated DB biography (e.g. manu-rehani) renders via a story layout, NOT the
standard ProfileDetail layout — so a feature added only to ProfileDetail is
invisible on exactly the high-value profiles that have rich content.

**Why:** the footstep list was originally a copy-pasted `EXPERIMENTS.filter(
relatedCategorySlugs.includes(e.categoryId))` in all three. Adding a category-tagged
"interactive lab" (e.g. Manu Rehani's cNLP lab, category `neuroscience`) made it
leak onto unrelated neuroscience profiles through the two paths that weren't updated.

**How to apply:** use the shared `selectFootstepExperiments(slug, categorySlugs)`
helper in `lib/experiments.ts` (signature labs first via `SIGNATURE_EXPERIMENTS`,
then a category match that EXCLUDES `interactive` labs). Interactive/bespoke labs
must be surfaced only via the per-slug signature map, never the category match.

**Living-vs-past hero pill:** `GreatMindStory` is shared by historical and living
DB figures, so its eyebrow can't be hardcoded. `buildStoryFromProfile` sets
`eyebrow` ("Modern Visionaries" vs "Great Minds of the Past") via a contemporary
check: era keyword (contemporary/present/living/…) OR a lifespan lacking a closed
`YYYY – YYYY` range. LivingMindStory has its own present-tense eyebrow.

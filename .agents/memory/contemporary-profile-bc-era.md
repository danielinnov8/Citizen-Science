---
name: Contemporary vs historical profile classification
description: How the directory decides "Modern Visionaries" vs "Great Minds of the Past" and the BC/short-year gotcha.
---

`isContemporaryProfile(era, lifespan)` in `artifacts/citizen-science/src/lib/greatMinds.ts`
picks the cinematic hero eyebrow for DB-built stories.

**Rule:** a figure is historical (deceased) when the lifespan contains "BC"/"BCE",
or a closed birth–death year range of ANY digit length (e.g. "370–415",
"965 – 1040", "c. 325 BC – c. 265 BC"). A single open year ("b. 1947") or a
contemporary era keyword means living/modern.

**Why:** the original check only matched a 4-digit `YYYY–YYYY` range, so every
ancient figure (BC years or pre-1000 3-digit years — Euclid, Archimedes,
Aristotle, Hypatia, Ibn al-Haytham, Avicenna) fell through and was mislabeled
"Modern Visionaries". Adding the top-100 deceased scientists exposed it.

**How to apply:** when adding figures with BC or short-year lifespans, confirm the
hero eyebrow. The DB-built story path (not the hand-authored frontend tier) is
what renders these, so this only bites figures driven from `featured_profiles`.

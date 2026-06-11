---
name: Gemini free-tier daily request cap
description: The user's own GEMINI_API_KEY is on the free tier; a daily cap blocks live testing of any Gemini-backed route.
---
The user's `GEMINI_API_KEY` (used by the api-server agent chat, process-observation, and video relevance scoring) is on the Gemini free tier, which enforces `GenerateRequestsPerDayPerProjectPerModel-FreeTier` ≈ 20 requests/day for `gemini-2.5-flash`. Once exhausted, every Gemini call returns HTTP 429 `RESOURCE_EXHAUSTED` until the daily reset.

**Why:** This blocks end-to-end testing of any Gemini-backed feature late in the day, even when the feature code is correct. The agent chat route surfaces it as the generic SSE error "The science copilot is unavailable right now."

**How to apply:** When live chat/observation/video tests return that error or a 429, check the api-server workflow logs for `RESOURCE_EXHAUSTED` before assuming a code bug. Verify Gemini-dependent logic via component-level tests (e.g. the YouTube allowlist + marker stripper) instead, and defer the full live run until the quota resets or the key is upgraded to a paid tier.

**Update (2026-06): the key is no longer free-tier-limited.** Bulk grounded seeding (`seed-profiles` / `seed-stories`, each call uses Google Search grounding) ran ~170+ sequential grounded research calls across one session at `PACE_MS=800` with ZERO 429s. So a 429 is no longer the default expectation — if bulk seeding stalls now it's far more likely transient `FAIL (no usable research)` parse failures (the seeder is idempotent/resumable; just re-run and they recover within a few passes) than a daily cap. Don't under-pace or under-seed assuming a ~20/day wall.

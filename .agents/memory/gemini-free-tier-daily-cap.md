---
name: Gemini free-tier daily request cap
description: The user's own GEMINI_API_KEY is on the free tier; a daily cap blocks live testing of any Gemini-backed route.
---
The user's `GEMINI_API_KEY` (used by the api-server agent chat, process-observation, and video relevance scoring) is on the Gemini free tier, which enforces `GenerateRequestsPerDayPerProjectPerModel-FreeTier` ≈ 20 requests/day for `gemini-2.5-flash`. Once exhausted, every Gemini call returns HTTP 429 `RESOURCE_EXHAUSTED` until the daily reset.

**Why:** This blocks end-to-end testing of any Gemini-backed feature late in the day, even when the feature code is correct. The agent chat route surfaces it as the generic SSE error "The science copilot is unavailable right now."

**How to apply:** When live chat/observation/video tests return that error or a 429, check the api-server workflow logs for `RESOURCE_EXHAUSTED` before assuming a code bug. Verify Gemini-dependent logic via component-level tests (e.g. the YouTube allowlist + marker stripper) instead, and defer the full live run until the quota resets or the key is upgraded to a paid tier.

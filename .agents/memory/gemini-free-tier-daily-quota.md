---
name: Gemini free-tier daily request cap
description: The hard limit that blocks bulk grounded-search seeding; daily not per-minute.
---
The Gemini free tier enforces TWO quotas on `gemini-2.5-flash`:
- `GenerateRequestsPerMinutePerProjectPerModel-FreeTier` — ~5/min (sometimes reported as 20 in burst windows).
- `GenerateRequestsPerDayPerProjectPerModel-FreeTier` — **20 requests/day** (the real wall for bulk jobs).

**Why this matters:** any one-time bulk seed/research job that calls Gemini per item (e.g. researching ~100 people with grounded search) will exhaust the ~20/day cap after a dozen-ish items and then 429 for the rest of the day. The 429 body still includes a small `retryDelay` (e.g. 56s) but that is misleading for a DAILY quota — waiting does NOT recover it; only the daily reset (Pacific midnight) does.

**How to apply:**
- Distinguish per-minute vs per-day from `quotaId` in the 429 `QuotaFailure.violations`. If it's the daily one, STOP — don't keep retrying today.
- Make such seeds idempotent (skip-existing upsert) so they resume across days/runs.
- For same-day completion you need a paid key (raises/removes the daily cap) or a different provider. The Replit-managed Gemini integration is a separate key/quota from the user's own `GEMINI_API_KEY`.

**Update (2026-06): the active key is NO LONGER on the ~20/day free wall.** A single-session bulk run drove **572 sequential grounded-search research calls** (outreach contact research, server-paced ~1.2s/item) with **ZERO 429s / zero failures**. So do not plan bulk Gemini jobs around a ~20/day cap anymore — size sweeps for wall-clock/timeout limits, not quota. (The real constraint became the code-exec sandbox's 10-min hard timeout: keep grounded sweeps to ≤5–6 items×batches per call.) A 429 is now the exception, not the expectation.

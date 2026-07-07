---
name: Nobel-solutions seeder throughput
description: Why the laureate-solution seeder is throughput-bound (not quota-bound) and how concurrency finishes it in one session.
---

# Nobel-solutions seeder: throughput, not quota, is the wall

The `seed-nobel-solutions` script attributes grounded challenge solutions to each
Nobel laureate via one `researchWithSearch` (Google-Search-grounded Gemini) call
per laureate. Older memory assumed the Gemini free tier (~20 grounded req/day)
would cap this to a multi-day grind.

**Reality observed (2026-06):** 1000+ grounded calls ran in a single session with
ZERO 429s. The daily-quota assumption is stale for the current `GEMINI_API_KEY`;
the real bottleneck is per-call latency (~15-30s) under the bash tool's ~120s cap.

**How to apply:** `researchWithSearch` is stateless, so the seeder takes an
OPTIONAL 2nd CLI arg = concurrency (default 1, preserving sequential behavior):
`pnpm --filter @workspace/scripts run seed-nobel-solutions <limit> <concurrency>`.
Running `300 20` covers ~100-145 laureates per ~115s `timeout -s KILL` pass. A
429 from any worker still trips `stopped` and winds the pass down. Drive it in
bounded foreground passes (the bash tool exits -1 when the timeout SIGKILLs it,
but inserts persist), checking coverage between passes, then
`dump-nobel-solutions` + commit the JSON snapshot.

**Don't force matches:** ~6-9 laureates (fundamental particle physics — Higgs,
Englert, Glashow, Maskawa, Ketterle, Cornell — and a couple of Literature poets)
legitimately have NO link to the applied grand challenges. The prompt instructs
the model to return an empty array rather than fabricate, so they stay uncovered
on purpose. Full numeric coverage is NOT the goal; grounded honesty is.

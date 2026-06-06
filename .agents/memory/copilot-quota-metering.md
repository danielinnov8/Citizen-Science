---
name: Copilot daily quota metering
description: Why the copilot quota meters guests (anon cookie) as well as logged-in free users.
---
The science-copilot chat route (`/api/agent/chat`) is PUBLIC and the `/agent` page is an unprotected route — guests can chat without an account.

Rule: the ~10/day free-tier quota must meter BOTH authenticated free users (subjectKey `user:<id>`, upgrade → /pricing) AND anonymous guests (signed `cs_anon` cookie, subjectKey `guest:<anonId>`, prompt → /login).

**Why:** if only logged-in users were metered, a free user could bypass the cap simply by logging out and chatting as a guest. Metering is keyed per UTC day in the `copilot_usage` table (one row per subject+date) so it resets at midnight UTC with no cron. Paid plans (users.plan != "free") are unlimited and skip metering entirely.

**How to apply:** any new entitlement gate on a public/guest-accessible endpoint should consider the guest bypass path, not just the authenticated path. Metering fails OPEN (a DB error never blocks the reply).

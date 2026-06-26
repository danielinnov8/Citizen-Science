---
name: Outreach pipeline safety
description: Invariants for the directory→outreach prospect pipeline (queue, research, review, send)
---

# Outreach pipeline safety

Living `featured_profiles` rows can be queued as outreach prospects (`source=directory`)
in `needs_review` with a null email; deceased figures are NEVER queued (gated by
`isLivingEra` in `artifacts/api-server/src/lib/profiles/living.ts`).

**Send gate (do not weaken):** the scheduler batch query AND the single-send path must
only ever send to prospects that are `status=pending` AND `reviewState=approved` AND
`email IS NOT NULL`. The single-send helper also defensively throws on an email-less
prospect. Approval is the human checkpoint — research/queue never sets `approved`.

**Why:** prospects are auto-enriched by Gemini web research which can return wrong/empty
contact info; sending before a human approves would blast real people with bad data.

**Resend from-domain:** outreach `fromEmail` default is `outreach@citizen-science.org`
(the verified Resend domain). A non-verified from address makes Resend reject the send.

**OpenAPI gotcha:** the PATCH prospect `email` must be nullable (`type: ["string","null"]`)
to match the server which clears email on null/empty — otherwise the generated TS type is
`string` and the admin UI can't clear/leave it unset.

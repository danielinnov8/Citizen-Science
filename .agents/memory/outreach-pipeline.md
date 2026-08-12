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

**Resend from-domain:** outreach `fromEmail` must live on the verified Resend domain
(citizen-science.org) or Resend rejects the send. Sends BCC the from address —
Resend bypasses Gmail, so the BCC is the sender's only paper trail.

**Approval can be explicit OR implicit:** sends still require pending + approved +
email, but selecting prospects in the campaigns UI batch action ("Generate & send
selected") approves in place — the selection IS the approval. Core invariant:
approval and the final send claim must NEVER overwrite a concurrent contact change
(unsubscribe, status flip, email edit) — both are single atomic conditional
UPDATEs whose committed values win, and a lost race skips the item loudly. Batch
sends run as background jobs with polling, never synchronously in a request. No
path sends to a needs_review prospect without an admin explicitly choosing it.

**Email copy rules (from the founder's design brief — do not regress):** institutional,
understated founder's letter; every invitation must name the recipient's real
field/contribution (send-time gate refuses drafts stuck on the generic fallback);
no hype/social-proof inflation ("thousands of scientists" is banned); one primary
link with descriptive anchor + visible raw URL; ~120-word body; institutional
subject ("Invitation to Citizen Science — {{name}}"); muted footer with opt-out;
text/plain multipart always sent.

**Sticky drafts + claim-first sends (do not weaken):** the personalised email is
generated ONCE (at approve/preview/first send), persisted on the prospect row, and
sends always use the PERSISTED draft — what the admin reviewed is exactly what goes
out. Sends claim the prospect atomically (pending→contacted, gated) BEFORE calling
Resend, so overlapping batch/manual sends can't duplicate. Rollback is allowed ONLY
for definite no-send (pre-attempt failure or Resend 4xx rejection) and must be scoped
to the attempt's claim marker so it can't stomp a concurrent admin unsubscribe.
Ambiguous post-attempt failures (network/5xx/parse — Resend has no idempotency keys)
and post-acceptance bookkeeping failures KEEP contacted + log loudly for manual
reconciliation. Resends: flip status back to pending in the admin editor, then send.

**Why:** double-emailing a Nobel laureate is the worst outcome; the code trades
retryability for never-duplicating whenever the send outcome is uncertain.

**OpenAPI gotcha:** the PATCH prospect `email` must be nullable (`type: ["string","null"]`)
to match the server which clears email on null/empty — otherwise the generated TS type is
`string` and the admin UI can't clear/leave it unset.

**Shared research helper:** the contact-research prompt + sanitizer live in the Gemini lib
(`researchPublicContact` in `@workspace/integrations-gemini-ai-server`) so the admin route
wrapper and the bulk script (`research-laureate-contacts`) can't drift. `isLivingEra` is
now mirrored in THREE places (web client, api-server, the script) — a null/empty era must
read as historical (NOT living) in all of them; keep in lockstep.

**Era discipline-labels read as living:** `isLivingEra` treats anything without a closed
YYYY–YYYY range as living, so legacy rows with eras like "20th-Century Physics" made
DECEASED figures (Feynman, Bohr, Planck…) queue as outreach prospects. Fix at the root:
set such profiles' `era` to a closed lifespan range — never special-case the queue logic.
Organizations ("Est. YYYY") are correctly living/contactable; some living scientists have
odd open eras ("since the 1980s") — audit by name before bulk-fixing.

**Deep email pass:** `researchDeepContact` (Gemini lib) is the second pass for figures the
first pass found no email for — hunts faculty pages/directories/CVs/press offices and may
return an institutional-route email with attribution in notes. Idempotency marker is
`contactInfo.deepSearched` (JSONB, not on the wire; admin PATCH drops it, making an edited
email-less row re-eligible — intended).

**Suggested emails can be misattributed:** grounded research sometimes returns a real-looking
email belonging to someone else (seen: a laureate assigned another person's address at a
dubious domain). Format validation can't catch this — the `needs_review` gate is the
mitigation and admins must verify attribution per-email, never bulk-approve.

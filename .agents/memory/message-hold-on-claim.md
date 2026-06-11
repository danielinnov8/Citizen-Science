---
name: Message hold-on-claim for unclaimed living members
description: How directory messages to unclaimed living members are held and later delivered, and the living/historical heuristic shared by client + server.
---

# Held messages for unclaimed living directory profiles

Members can message ANY living directory profile, even one with no verified owner
yet. Such a message is **held**, then delivered when that profile is claimed.

- A held message = `messages.recipient_id` NULL + `messages.profile_slug` set.
  A delivered/direct message has `recipient_id` set. Profile-routed sends also
  record `profile_slug` for provenance; direct member-to-member sends leave it null.
- On send (`POST /messages` with `profileSlug`): if the profile has an owner →
  deliver now; if not and the era is **living** → hold (`held: true` in response);
  if not and the era is **historical** → 404 (historical figures can never claim).
- Delivery trigger: admin approving a claim (`/admin/claims/:id/approve`) sets
  `featuredProfiles.ownerId` AND, in the same txn, runs an UPDATE that sets
  `recipient_id = newOwner` for rows matching the slug where `recipient_id IS NULL`
  and `sender_id <> newOwner` (skip anything the claimant sent themselves).

## Living vs historical heuristic — keep client + server in lockstep
**Rule:** a closed `YYYY–YYYY` lifespan range in the free-text `era` ⇒ historical;
anything else ("b. 1971", "Contemporary", "21st century") ⇒ living. Regex:
`/\b\d{4}\s*[-–—]\s*\d{4}\b/` (note the en/em dashes, not just hyphen).

**Why:** `era` is the ONLY lifespan signal on a profile row; there is no
`isLiving`/`birthYear` column. The directory "Message" affordance (frontend) and
the server's hold-vs-reject decision must agree on who is living.

**How to apply:** the helper is intentionally duplicated — `isLivingEra` exists in
BOTH `artifacts/citizen-science/src/lib/living.ts` and
`artifacts/api-server/src/lib/profiles/living.ts` (different runtimes, no shared
domain lib). If you change the heuristic, change both copies together.

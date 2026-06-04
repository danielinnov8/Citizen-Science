---
name: Affiliate & referral links in copilot
description: How partner/lab referral links and Amazon Associates tagging are modeled in the science copilot.
---

# Referral links = full URL slots, not base+code

Labs (`lib/labs.ts`) and partners (`lib/partners.ts`, duplicated server + client) each carry a
single `referralUrl` slot. The resolver (`labUrl()` / `partnerUrl()`) returns `referralUrl` when
set, else the plain base URL. Adding a code later = paste the whole affiliate link in one line.

**Why:** real affiliate programs hand you a *full tracking URL* (e.g. 23andMe =
`https://refer.23andme.com/s/<code>`), not a code you append to the homepage as a query param.
The original task spec said "base URL + referral code" but that doesn't fit how these programs
actually work, so we use a full-URL slot instead.

**How to apply:** when seeding a new partner or attaching a referral to a lab, fill `referralUrl`
with the complete link. Empty `""` degrades to the plain link — never breaks.

# Amazon Associates auto-tagging

Master tag (`AMAZON_ASSOCIATE_TAG` in `api-server/src/lib/amazon.ts`) is appended to any
amazon.* link in the copilot's reply text and in grounded source links. Text tagging is
streaming-safe via `AmazonTagger` (buffers a trailing non-whitespace run so a URL split across
SSE chunks is never half-tagged), chained after `VideoMarkerStripper`.

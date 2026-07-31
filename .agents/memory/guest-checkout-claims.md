---
name: Guest founding checkout & webhook atomicity
description: Guest (pre-auth) Stripe purchases are claimed on register/login by email; webhook effects must be one transaction with marker-claim ordering.
---

Guest founding-member checkout: buyers pay BEFORE having an account. `POST /billing/checkout-guest` (public, founding-tagged prices only, per-IP rate limit) creates a session with no `customer`; the webhook matches an account by `customer_details.email` or parks a row in `founding_claims`; register/login/Google-OAuth call `claimFoundingMemberships`, which acquires claims atomically (`UPDATE ... WHERE claimed_at IS NULL ... RETURNING` inside a transaction) then grants. `GET /billing/checkout-session/:sessionId` powers the post-payment page but MUST 404 any non-founding session (session ids are bearer links — never leak emails for unrelated purchases).

**Why:** guests have no user id at checkout; email is the only join key. The public session lookup originally returned buyer emails for ANY paid session (PII leak flagged in review).

**How to apply:**
- Founding = LIFETIME plan floor: every webhook mutation of `users.plan` (subscription created/updated/deleted) must respect `foundingMember` + plan rank — a founder's plan can be raised but never lowered, and cancellation only detaches the subscription id.
- Webhook checkout effects: fetch Stripe line items BEFORE inserting the `stripe_processed_events` marker (API failure → no marker → retry reprocesses); the unique-constrained marker insert is the atomic ownership claim (concurrent duplicates conflict-and-skip); run ALL DB effects (grant, customer link, claim park, top-up credits) in ONE `db.transaction` (pg.Pool driver supports it; neon-http would not); on failure delete the marker and rethrow so Stripe retry completes the purchase. Never apply effects partially outside a transaction — a retry double-credits top-ups.
- Grant helpers (`grantFoundingToUser`, `recordUnclaimedFoundingPurchase`, `addTopupCredits`) accept an optional executor param so they can run inside a caller's transaction.

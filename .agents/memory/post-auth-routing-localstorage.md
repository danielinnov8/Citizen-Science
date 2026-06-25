---
name: Post-auth routing via localStorage
description: How the citizen-science app routes users after login/onboarding, and why URL query params don't work for carrying intent across the auth hop.
---

# Post-auth routing is driven by localStorage flags, not query params

After authentication, `Login.routeAfterAuth` and `Onboarding.handleComplete`
decide where to send the user by reading **localStorage** flags
(`cs.postAuthRedirect`, `cs.pendingPrompt`, `cs.pendingCheckout`). A `?redirect=`
(or any) URL query param passed to `/login` is **silently ignored**.

**Why:** this caused the "pricing card goes through onboarding then loses the
path" bug — the checkout hook sent logged-out users to `/login?redirect=/pricing`
but Login never read that param. New (not-onboarded) users hit the `/onboarding`
branch first and the purchase intent vanished.

**How to apply:**
- To carry any intent across the login hop, write a localStorage flag and make
  `routeAfterAuth` / `handleComplete` honor it (priority order matters — the
  not-onboarded → `/onboarding` branch will otherwise swallow it).
- Paid checkout is **transaction-first**: persist `cs.pendingCheckout=priceId`
  before redirecting to `/login`; after auth, route to `/pricing`, which
  auto-resumes the Stripe session (clearing the flag) before onboarding runs.
- Post-payment routing (`?checkout=success`) picks new-vs-existing from
  `hasCompletedOnboarding` (the browser-scoped `cs_onboarded` localStorage flag).
  That is the ONLY new-vs-existing signal — there is no server-side onboarding
  flag — so a returning user on a fresh browser will be treated as new.
- When auto-resuming, the checkout call must report whether it actually
  navigated, so a failed/empty session can release the loading overlay instead
  of stranding the user.

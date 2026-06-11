---
name: OAuth redirect_uri must track request origin
description: Why Google OAuth redirect_uri is derived from the (allowlisted) request host, not REPLIT_DOMAINS[0], on multi-domain autoscale deployments.
---

# OAuth redirect_uri must follow the origin the user is on

The Google OAuth redirect_uri is built from the **actual request origin** (the
forwarded Host), validated against an allowlist of `REPLIT_DOMAINS` +
`PUBLIC_BASE_URL` host — NOT blindly from `REPLIT_DOMAINS.split(",")[0]`.

**Why:** On Replit autoscale (Cloud Run) a deployment can be reachable on
several domains (the `.replit.app` domain plus custom domains). If `/authorize`
builds the redirect_uri from the first REPLIT_DOMAINS entry while the user is
browsing a different bound domain, Google redirects back to a domain where the
signed `cs_oauth_state`/`cs_oauth_verifier` cookies (SameSite=Lax, scoped to the
origin they were set on) do not exist → the callback's state check fails → user
lands on `/login?error=google` ("Google sign-in didn't complete"). Keeping the
whole round-trip on one origin also guarantees the redirect_uri at authorize
equals the one at token exchange (required for the exchange to succeed).

**How to apply:** Derive redirect_uri from `req.get("host")` but only honor it
when the host is local or in the allowlist (so a spoofed Host header can't point
the flow at an attacker origin); otherwise fall back to REPLIT_DOMAINS[0].
`PUBLIC_BASE_URL` is an explicit override that wins over everything.

**Also required (config, not code):** every domain the user signs in from must
have `https://<domain>/api/auth/google/callback` registered as an Authorized
redirect URI in the Google Cloud Console OAuth client. Symptom disambiguation:
`error=google` = callback failed after Google redirected back (secrets ARE set);
`error=google_unconfigured` = GOOGLE_CLIENT_ID/SECRET missing.

## Don't put the OAuth handshake in browser cookies on autoscale

Storing the PKCE verifier/state in signed cookies is fragile across the
cross-domain Google→callback hop on multi-instance autoscale: the callback can
land where the cookie isn't readable, giving an intermittent `error=google` with
no server exception (it's a precondition failure, not a thrown error).

**Fix:** persist the handshake server-side in a DB table keyed by `state`
(verifier + exact redirect_uri + expiry), single-use `DELETE ... RETURNING` at
callback. Google echoes `state` back, so any instance/domain can resolve it.

**But state-in-DB alone is login-CSRF:** the callback would accept any valid
code/state with no browser binding. Bind completion to the originating browser
with a nonce: store `sha256(nonce)` in the row, set the raw nonce in a SIGNED
HttpOnly Secure SameSite=Lax short-TTL cookie, and at callback require a
`timingSafeEqual` hash match. The nonce cookie survives because the whole flow is
kept same-origin (see redirect_uri origin-pinning above).

**Why:** combines reliability (DB lookup, instance-agnostic) with security (PKCE
+ CSRF binding) without putting the security-critical verifier in a cookie.

**Migration gotcha:** an ephemeral handshake table is safe to clear on upgrade —
`ADD COLUMN ... NOT NULL` with no default fails on a non-empty table, so prepend
`DELETE FROM <table>;` before the NOT NULL add (no durable data to backfill).

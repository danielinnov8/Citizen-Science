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

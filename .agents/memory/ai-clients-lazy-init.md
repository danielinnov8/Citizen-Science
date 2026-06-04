---
name: AI integration clients must lazy-init
description: Why the OpenAI/Gemini server clients construct on first use, not at import
---

# AI integration clients are lazy-initialized

The `@workspace/integrations-openai-ai-server` and
`@workspace/integrations-gemini-ai-server` clients construct their SDK client
(and validate their env vars) on first use via `getOpenAI()` / `getGenAI()`,
NOT at module import.

**Why:** When they threw at import time, importing the module from a route
crash-looped the entire api-server process on any host missing that provider's
env vars. The OpenAI proxy vars (`AI_INTEGRATIONS_OPENAI_*`) are Replit-injected
and absent on Google Cloud Run, so the server died at boot before
`/api/healthz` could respond — breaking the Cloud Run deploy. Lazy init lets the
process boot with only the provider(s) actually configured; an unconfigured
route fails cleanly at call time instead.

**How to apply:** Any new server-side integration client wrapper in `lib/`
should defer SDK construction and env validation into a cached getter, and route
handlers should call that getter inside the request (so the existing try/catch
returns a clean error). Never throw at module top level for missing env in a
shared server lib.

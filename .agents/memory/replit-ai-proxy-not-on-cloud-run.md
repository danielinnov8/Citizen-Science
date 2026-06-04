---
name: Replit AI proxy fails outside Replit
description: Why OpenAI-via-Replit-proxy routes break on Cloud Run and how to pick an AI provider that works in production
---

# Replit AI proxy is only reachable inside Replit

The `@workspace/integrations-openai-*` libs talk to OpenAI through Replit's AI
proxy, configured via `AI_INTEGRATIONS_OPENAI_BASE_URL` /
`AI_INTEGRATIONS_OPENAI_API_KEY`. Those env vars are injected only inside the
Replit environment. On an external host (Google Cloud Run, any self-hosted
deploy) they are absent, the lazily-constructed client throws, and the route
surfaces a generic "unavailable" error — even though it works fine in the dev
preview.

**Why:** the copilot chat looked broken in prod but fine in dev for exactly this
reason. The Gemini route kept working because it uses the user's OWN
`GEMINI_API_KEY` (a plain Google API key), which is reachable from anywhere.

**How to apply:** for any artifact that will be deployed OUTSIDE Replit, do not
back runtime AI calls with a Replit-proxy integration. Use a provider the user
holds their own key for (e.g. `@google/genai` + `GEMINI_API_KEY`) and make sure
that key is set in the production env. Reserve Replit-proxy integrations for
features that only ever run inside Replit.

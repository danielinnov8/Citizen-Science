---
name: Gemini Google Search grounding
description: How to enable Google Search grounding on gemini-2.5-flash and the thinking gotcha
---

# Gemini Google Search grounding (gemini-2.5-flash)

Enable grounding by passing `tools: [{ googleSearch: {} }]` in the `generateContent`/`generateContentStream` config. Cited sources come back in `response.candidates[0].groundingMetadata.groundingChunks[].web` (`{ uri, title }`); in a stream they arrive across chunks, so accumulate and de-dupe by URL.

**Gotcha — thinking must stay ON for grounding.** If you set `thinkingConfig: { thinkingBudget: 0 }` *and* enable the Search tool, the model never decides to invoke search and just answers from its training data (it will even say its knowledge cutoff is 2023). Only disable thinking on the non-grounded path.

**Why:** flash uses its thinking step to decide whether/what to search. Budget 0 removes that step, so the tool is effectively ignored.

**How to apply:** when `useSearch`, omit the thinkingConfig (let thinking run) and give a larger `maxOutputTokens` (~4096) because thinking tokens count against the output budget — a small budget yields truncated/empty replies. Run the grounded pass first and fall back to ungrounded if it errors before any text streams.

**Note:** source URLs are `vertexaisearch.cloud.google.com/grounding-api-redirect/...` redirect links (not the raw publisher URL), and `web.title` is usually the publisher domain (e.g. `nih.gov`). Render the title; the redirect host is noise.

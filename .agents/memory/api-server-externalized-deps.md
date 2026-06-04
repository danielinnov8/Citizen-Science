---
name: api-server externalized deps
description: Why some runtime packages must be declared as direct deps of the api-server artifact, not just a workspace lib.
---

# api-server externalized runtime deps

`artifacts/api-server/build.mjs` bundles the server with esbuild but keeps an `external` allowlist of packages that break when bundled (path traversal / native / proto loading). It includes globs like `@google/*`, `@google-cloud/*`, `protobufjs`, `sharp`, `@grpc/*`, etc.

**Rule:** if an externalized package is used only transitively through a workspace lib (e.g. `@google/genai` imported inside `lib/integrations-gemini-ai-server`), the build succeeds but the server crashes at startup with `ERR_MODULE_NOT_FOUND: Cannot find package '@google/genai'`. esbuild leaves the import in the output, and Node resolves it relative to `artifacts/api-server/dist`, where pnpm has not linked it.

**Fix:** declare the externalized package as a *direct* dependency of `@workspace/api-server` (in addition to the lib that uses it) so pnpm symlinks it into `artifacts/api-server/node_modules`. Bundled (non-external) deps like `openai` do not need this — they get inlined into `dist/index.mjs`.

**Why:** the difference between `openai` working transitively and `@google/genai` not is purely the `external` list in `build.mjs`. Check that list before assuming a missing-package runtime error is an install problem.

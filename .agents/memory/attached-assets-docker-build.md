---
name: attached_assets must be in the Docker build context
description: Why the Cloud Run image build fails with ENOENT on @assets imports, and how the Dockerfile must handle repo-root attached_assets.
---

# attached_assets and the production Docker build

The citizen-science **web app** imports media from the repo-root
`attached_assets/` directory through its Vite `@assets` alias
(`@assets` → `<repo>/attached_assets`). Examples: the inventor photo in
`inventors.ts` and the globe earth textures in `NetworkGlobe.tsx`.

**Rule:** any file imported via `@assets` is a real build input for the web
app. The production Dockerfile builds the web app (`pnpm --filter
@workspace/citizen-science run build`), so the builder stage MUST have those
files, which means BOTH:
1. `.dockerignore` must NOT exclude `attached_assets` (it once did, with a
   stale comment "not needed to build/run the api-server" — that predated the
   web app being added to the image build), and
2. the Dockerfile must `COPY attached_assets ./attached_assets` before the web
   build step.

**Why:** without them, `vite build` dies with
`[vite:asset] Could not load /repo/attached_assets/<file>: ENOENT`. This is a
**deploy-only** failure — `pnpm dev` and local typecheck never touch the Docker
context, so it passes locally and only blows up in Cloud Build.

**How to apply / verify:** reproduce the prod build locally with
`PORT=3000 BASE_PATH=/ pnpm --filter @workspace/citizen-science run build`; the
emitted `dist/public/assets/` should contain every `@assets` file. The runtime
stage does NOT need raw `attached_assets` — Vite copies referenced assets into
`dist/public`, which is what gets copied into the final image.

**Tradeoff noted:** `COPY attached_assets` pulls the whole scratch dir
(screenshots, docx) into the build context. Acceptable, but if it ever needs
trimming, prefer moving the few app-owned assets under
`artifacts/citizen-science/src/assets/` (always in context) over a fragile
`.dockerignore` allowlist that silently breaks when a new asset is imported.

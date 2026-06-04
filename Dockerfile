# syntax=docker/dockerfile:1

# Multi-stage build for the @workspace/api-server Express service.
# Built from the MONOREPO ROOT so pnpm workspace packages (@workspace/*) resolve.
# Standard Buildpacks cannot do this when pointed at a sub-folder.

# ---------------------------------------------------------------------------
# Stage 1: builder — install all deps and build the workspace, then produce a
# self-contained, production-only deploy tree for the api-server.
# ---------------------------------------------------------------------------
FROM node:24-slim AS builder

# Enable the exact pnpm version used by the repo via corepack.
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /repo

# Copy the workspace manifests first so dependency installation is cached
# independently of source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy every workspace package directory so the full monorepo context is
# visible to pnpm (workspace links, the catalog, and project references).
COPY lib ./lib
COPY artifacts ./artifacts
COPY scripts ./scripts
COPY tsconfig.base.json tsconfig.json ./

# Install all dependencies (incl. dev) deterministically from the lockfile.
RUN pnpm install --frozen-lockfile

# Build only the api-server (its build typechecks libs and bundles the server
# to artifacts/api-server/dist/index.mjs via esbuild).
RUN pnpm --filter @workspace/api-server run build

# Produce a flattened, production-only deploy directory. This bakes a local
# node_modules (with a self-contained .pnpm store) so externalized runtime
# packages like @google/genai — which esbuild does NOT bundle — resolve at
# runtime. The built dist/ is copied along with it.
RUN pnpm --filter @workspace/api-server deploy --prod --legacy /app

# ---------------------------------------------------------------------------
# Stage 2: runtime — minimal image containing only the deploy output.
# ---------------------------------------------------------------------------
FROM node:24-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Copy the self-contained app (dist + production node_modules) from the builder.
COPY --from=builder /app ./

# Cloud Run injects PORT at runtime; the server reads process.env.PORT and
# fails fast if it is missing. Do not hardcode it. GEMINI_API_KEY is provided
# via the Cloud Run "Variables & Secrets" panel — never baked into the image.
CMD ["node", "--enable-source-maps", "dist/index.mjs"]

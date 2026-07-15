---
name: Production DB data seeding (publish syncs schema, not data)
description: Why prod DB starts empty after publish and the committed-snapshot + boot-seeder pattern to fix it
---

# Production database data is NOT copied on publish

Replit's Publish flow diffs and applies the DB **schema** dev→prod, but it never
copies **row data**. Dev and prod are separate managed Postgres databases. So any
content that exists only because it was generated/seeded into the dev DB (e.g. the
Gemini-generated `featured_profiles` directory) will be **missing in production** —
DB-backed pages 404 in prod while working in dev.

**Why:** Profile detail pages without a hand-authored frontend story (the "frontier
minds": manu-rehani, peter-diamandis, salim-ismail, dave-blundin,
alexander-wissner-gross) fall through to `useGetFeaturedProfile` → the DB. Prod had
0 rows (dev had 49) AND a stale schema (missing the story columns like biography,
patents, timeline), so they failed only in production.

**Key constraint:** the `executeSql` tool's `environment:"production"` is READ-ONLY,
so the agent cannot write prod data directly. But the **api-server itself** has full
write access to the prod DB (it already writes users/sessions), so the server can
seed.

**The fix pattern (use for any dev-only content data that must reach prod):**
1. Dump the dev rows to a committed snapshot (`scripts/src/dump-featured-profiles.ts`
   → `artifacts/api-server/src/data/featured-profiles.json`; re-run when dev data
   changes).
2. Idempotent boot-seeder (`artifacts/api-server/src/lib/seed/featuredProfiles.ts`)
   called fire-and-forget after `app.listen` in `index.ts`: no-ops when the table is
   non-empty, inserts with `onConflictDoNothing({ target: slug })` for multi-instance
   safety, and never throws (logs only) so it can't crash boot.
3. User must **republish** — that applies the schema diff (new columns) AND ships the
   seeding code together; the new revision boots and seeds the empty prod DB.

**How to apply:** esbuild inlines the JSON import (`with { type: "json" }`) into the
bundle, so no separate asset shipping is needed. This is data seeding, not DDL —
distinct from the forbidden startup-time schema migration.

**Editing the snapshot after a row already seeded:** the seeder is
`onConflictDoNothing`, so changing an existing row in `featured-profiles.json` will
NOT update the dev DB. To propagate an edit: `DELETE FROM featured_profiles WHERE
slug = '...'` then restart api-server to reseed that row. (Prod gets the new JSON on
next publish only for rows not yet present there.)

**Profile portraits:** never hotlink press-wire/campaign image URLs (unstable,
CORP-blocked, or press-cycle cached). Self-host: copy to `attached_assets/` and
import via `@assets` in frontend data files; for the DB `imageUrl`, use a
site-relative path under `artifacts/citizen-science/public/avatars/`.

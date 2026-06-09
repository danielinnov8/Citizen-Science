---
name: drizzle-kit relative out path
description: Why lib/db/drizzle.config.ts uses a relative `out` path for migrations.
---

`drizzle-kit generate` (v0.31.x) fails reading existing migration snapshots when
the config's `out` is an ABSOLUTE path. Its snapshot validation prefixes `./` to
the path, producing a malformed `.//home/runner/...` and an ENOENT on
`meta/0000_snapshot.json`. The first-ever generate (no snapshots yet) doesn't hit
this code path, so the bug only appears once a migration already exists.

**Rule:** keep `out: "./migrations"` (relative) in `lib/db/drizzle.config.ts`, not
`path.join(__dirname, "./migrations")`.

**Why:** package scripts always run with cwd at the package root, so the relative
path resolves correctly and avoids the `./`+absolute concatenation bug.

**How to apply:** `push` is unaffected (it never reads the snapshot folder), so a
broken `generate` with a working `push` is the signature of this issue. Runtime
boot migrations resolve the folder independently, so the relative `out` is safe
there too.

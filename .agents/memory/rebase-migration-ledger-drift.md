---
name: Rebase migration-ledger drift
description: Why dev DB silently diverges after a rebase that renumbers/replaces drizzle migrations, and the clean fix.
---

# Rebase migration-ledger drift

When a rebase onto main **renumbers or replaces** drizzle migrations (e.g. our
messages migration loses its `0007` slot to main's mentorship migration and is
regenerated as `0008`), the dev database's drizzle ledger drifts out of sync
with the new canonical migration history.

**Why it bites:** drizzle's migrator decides what to apply by **timestamp**
(`__drizzle_migrations.created_at` vs each journal entry's `when`), NOT by hash
or filename. So after history is rewritten:
- Migrations whose new `when` is <= the last recorded timestamp are silently
  SKIPPED even though their tables/columns were never created in dev (e.g.
  mentorship tables missing, `users.is_mentor` missing).
- Stale columns from our OLD discarded migrations persist (e.g.
  `featured_profiles.owner_id` instead of main's `owner_user_id`; old
  `profile_claims` shape).
- Only a migration with a brand-new (latest) timestamp is seen as pending, and
  it can fail (`relation "messages" already exists`) because the table was
  created under the old history.

**How to apply (DEV only):** don't whack-a-mole individual tables. If dev holds
only disposable data (check first: `users`, `messages` counts, and whether
`featured_profiles.biography` is populated — enriched bios are the only
expensive-to-regenerate data, restored by neither the boot seeder nor cheaply
by the rate-limited seed-stories script), do a clean reset and let boot replay
the canonical migrations:

```sql
DROP SCHEMA public CASCADE; CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
DROP SCHEMA IF EXISTS drizzle CASCADE;  -- wipes the ledger too
```

Then restart `artifacts/api-server: API Server`; boot runs migrations
0000..N cleanly and the boot seeder repopulates featured_profiles. Verify boot
logs show "Database migrations applied" + "Seeded featured profiles", and that
the expected tables/columns exist and the ledger count == journal entry count.

**Never** do this against production — prod is fresh per deploy and applies the
canonical sequence from empty. This reset is a dev-only reconciliation.

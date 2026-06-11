-- Custom SQL migration file, put your code below! --

-- Reconcile drift on databases whose `users` table was created by an early
-- `drizzle-kit push` BEFORE the versioned baseline (0000) existed. The baseline
-- uses `CREATE TABLE IF NOT EXISTS "users"`, which is a no-op on a pre-existing
-- table and therefore never adds the `plan` column. Without this column the
-- register/login code (which reads/writes `users.plan`) throws
-- "column \"plan\" does not exist" and returns a 500. This statement is
-- idempotent, so it is a no-op on databases that already have the column.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'free' NOT NULL;

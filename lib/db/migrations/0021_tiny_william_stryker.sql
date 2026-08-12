-- Idempotent: prod replays migration files at boot, so every statement must be
-- safely re-runnable.
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "draft_subject" text;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "draft_body" text;

DO $$ BEGIN
 CREATE TYPE "public"."prospect_source" AS ENUM('manual', 'directory');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."prospect_review_state" AS ENUM('needs_review', 'approved');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "profile_id" uuid;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "source" "prospect_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "review_state" "prospect_review_state" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "contact_info" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "researched_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outreach_prospects" ADD CONSTRAINT "outreach_prospects_profile_id_featured_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."featured_profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_prospects_profile_id_unique" ON "outreach_prospects" ("profile_id");--> statement-breakpoint
ALTER TABLE "outreach_settings" ALTER COLUMN "from_email" SET DEFAULT 'outreach@citizen-science.org';--> statement-breakpoint
UPDATE "outreach_settings" SET "from_email" = 'outreach@citizen-science.org' WHERE "from_email" = 'outreach@citizenscience.app';

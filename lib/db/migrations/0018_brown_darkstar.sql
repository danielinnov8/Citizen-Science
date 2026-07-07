DO $$ BEGIN
        CREATE TYPE "public"."prospect_review_state" AS ENUM('needs_review', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
        CREATE TYPE "public"."prospect_source" AS ENUM('manual', 'directory');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_responses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "path" text DEFAULT 'member' NOT NULL,
        "claim_profile_slug" text,
        "role" text,
        "interests" text[] DEFAULT '{}' NOT NULL,
        "primary_goal" text,
        "ambition" text,
        "insights" text[] DEFAULT '{}' NOT NULL,
        "summary" text,
        "transcript" text,
        "source" text DEFAULT 'agentic' NOT NULL,
        "completed_at" timestamp with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outreach_prospects" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_settings" ALTER COLUMN "from_email" SET DEFAULT 'outreach@citizen-science.org';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "profile_id" uuid;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "source" "prospect_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "review_state" "prospect_review_state" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "contact_info" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach_prospects" ADD COLUMN IF NOT EXISTS "researched_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
        ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_responses_user_id_unique" ON "onboarding_responses" USING btree ("user_id");--> statement-breakpoint
DO $$ BEGIN
        ALTER TABLE "outreach_prospects" ADD CONSTRAINT "outreach_prospects_profile_id_featured_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."featured_profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_prospects_profile_id_unique" ON "outreach_prospects" USING btree ("profile_id");

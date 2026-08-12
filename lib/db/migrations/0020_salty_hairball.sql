-- Idempotent: prod replays migrations at boot, and the founding_claims /
-- founding_member drift entries may already exist there (applied by a
-- renumbered migration). Every statement must be safely re-runnable.
CREATE TABLE IF NOT EXISTS "founding_claims" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"email" text NOT NULL,
"plan_id" text NOT NULL,
"stripe_customer_id" text,
"stripe_session_id" text NOT NULL,
"claimed_by_user_id" uuid,
"claimed_at" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'founding_claims_stripe_session_id_unique') THEN
    ALTER TABLE "founding_claims" ADD CONSTRAINT "founding_claims_stripe_session_id_unique" UNIQUE("stripe_session_id");
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "outreach_settings" ALTER COLUMN "from_email" SET DEFAULT 'daniel@citizen-science.org';--> statement-breakpoint
ALTER TABLE "outreach_settings" ALTER COLUMN "from_name" SET DEFAULT 'Daniel (Citizen Science)';--> statement-breakpoint
-- Data fix: settings rows already created with the old defaults (the admin
-- settings endpoint upserts on first visit) must not keep the old address.
UPDATE "outreach_settings" SET "from_email" = 'daniel@citizen-science.org', "from_name" = 'Daniel (Citizen Science)' WHERE "from_email" = 'outreach@citizen-science.org';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "founding_member" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'founding_claims_claimed_by_user_id_users_id_fk') THEN
    ALTER TABLE "founding_claims" ADD CONSTRAINT "founding_claims_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

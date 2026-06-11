CREATE TABLE IF NOT EXISTS "profile_claims" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"profile_id" uuid NOT NULL,
"user_id" uuid NOT NULL,
"email" text NOT NULL,
"status" text DEFAULT 'pending' NOT NULL,
"reviewed_by" uuid,
"reviewed_at" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_claims" ADD CONSTRAINT "profile_claims_profile_id_featured_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."featured_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_claims" ADD CONSTRAINT "profile_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_claims" ADD CONSTRAINT "profile_claims_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profile_claims_profile_user_unique" ON "profile_claims" USING btree ("profile_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "featured_profiles" ADD CONSTRAINT "featured_profiles_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

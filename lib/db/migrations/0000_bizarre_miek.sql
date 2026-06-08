CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text,
	"google_id" text,
	"image" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "featured_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"group" text DEFAULT 'scientist' NOT NULL,
	"field" text NOT NULL,
	"era" text NOT NULL,
	"summary" text NOT NULL,
	"contributions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quotes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_url" text,
	"related_category_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"patents" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tagline" text,
	"lifespan" text,
	"birthplace" text,
	"biography" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"story_contributions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"legacy" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"did_you_know" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"story_theme" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "featured_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "copilot_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_key" text NOT NULL,
	"usage_date" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "copilot_usage_subject_day_unique" UNIQUE("subject_key","usage_date")
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_id_users_id_fk'
	) THEN
		ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "patents" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "tagline" text;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "lifespan" text;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "birthplace" text;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "biography" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "timeline" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "story_contributions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "legacy" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "did_you_know" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_profiles" ADD COLUMN IF NOT EXISTS "story_theme" jsonb;

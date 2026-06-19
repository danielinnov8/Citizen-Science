CREATE TABLE "challenge_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_slug" text NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_members_challenge_slug_user_id_unique" UNIQUE("challenge_slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenge_solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_slug" text NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"approach" text NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"domain" text NOT NULL,
	"urgency" text NOT NULL,
	"summary" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"teams_json" text DEFAULT '[]' NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_members" ADD CONSTRAINT "challenge_members_challenge_slug_challenges_slug_fk" FOREIGN KEY ("challenge_slug") REFERENCES "public"."challenges"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_members" ADD CONSTRAINT "challenge_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_solutions" ADD CONSTRAINT "challenge_solutions_challenge_slug_challenges_slug_fk" FOREIGN KEY ("challenge_slug") REFERENCES "public"."challenges"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_solutions" ADD CONSTRAINT "challenge_solutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
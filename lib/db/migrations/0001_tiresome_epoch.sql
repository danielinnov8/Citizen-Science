CREATE TABLE IF NOT EXISTS "credit_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "subject_key" text NOT NULL,
        "period_key" text NOT NULL,
        "period_used" integer DEFAULT 0 NOT NULL,
        "topup_balance" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "credit_accounts_subject_key_unique" UNIQUE("subject_key")
);

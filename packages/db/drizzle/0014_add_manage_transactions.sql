-- Catch-up migration covering schema/snapshot drift: items that existed in
-- the Drizzle schema and meta snapshots but whose generating SQL migrations
-- were never committed.
--
-- Missing TABLES:
--   - finatalk_event_cache
--   - finatalk_template
--   - finatalk_template_tag
--   - finatalk_transaction
--   - finatalk_learning_note
--
-- Missing COLUMNS on finatalk_portfolio:
--   - account_type
--   - manage_transactions
--
-- Everything is idempotent (IF NOT EXISTS) so DBs that received parts of
-- this through manual ALTERs are unharmed.

-- ── finatalk_portfolio: missing columns ─────────────────────────────────
ALTER TABLE "finatalk_portfolio" ADD COLUMN IF NOT EXISTS "account_type" text;--> statement-breakpoint
ALTER TABLE "finatalk_portfolio" ADD COLUMN IF NOT EXISTS "manage_transactions" boolean DEFAULT false NOT NULL;--> statement-breakpoint

-- ── finatalk_event_cache ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "finatalk_event_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" date NOT NULL,
	"title" text,
	"details" jsonb,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_event_cache_symbol_idx" ON "finatalk_event_cache" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_event_cache_date_idx" ON "finatalk_event_cache" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_event_cache_fetched_idx" ON "finatalk_event_cache" USING btree ("fetched_at");--> statement-breakpoint

-- ── finatalk_template ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "finatalk_template" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "finatalk_user"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"description" text,
	"currency" text NOT NULL,
	"holdings" jsonb NOT NULL,
	"clone_count" numeric(10, 0) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_template_user_idx" ON "finatalk_template" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_template_created_idx" ON "finatalk_template" USING btree ("created_at");--> statement-breakpoint

-- ── finatalk_template_tag ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "finatalk_template_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL REFERENCES "finatalk_template"("id") ON DELETE CASCADE,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_template_tag_template_idx" ON "finatalk_template_tag" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_template_tag_tag_idx" ON "finatalk_template_tag" USING btree ("tag");--> statement-breakpoint

-- ── finatalk_transaction ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "finatalk_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"holding_id" text NOT NULL REFERENCES "finatalk_holding"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"price" numeric(24, 8) NOT NULL,
	"fee" numeric(24, 8) DEFAULT '0' NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_transaction_holding_idx" ON "finatalk_transaction" USING btree ("holding_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_transaction_date_idx" ON "finatalk_transaction" USING btree ("date");--> statement-breakpoint

-- ── finatalk_learning_note ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "finatalk_learning_note" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "finatalk_user"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finatalk_learning_note_user_idx" ON "finatalk_learning_note" USING btree ("user_id","updated_at");

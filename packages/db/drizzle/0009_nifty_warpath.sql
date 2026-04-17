CREATE TABLE "finatalk_alert" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"symbol" text NOT NULL,
	"condition_type" text NOT NULL,
	"threshold" numeric(24, 8) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_watchlist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_watchlist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"watchlist_id" text NOT NULL,
	"symbol" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finatalk_alert" ADD CONSTRAINT "finatalk_alert_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_watchlist" ADD CONSTRAINT "finatalk_watchlist_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_watchlist_item" ADD CONSTRAINT "finatalk_watchlist_item_watchlist_id_finatalk_watchlist_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."finatalk_watchlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finatalk_alert_user_idx" ON "finatalk_alert" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "finatalk_alert_symbol_idx" ON "finatalk_alert" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "finatalk_watchlist_user_idx" ON "finatalk_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "finatalk_watchlist_item_watchlist_idx" ON "finatalk_watchlist_item" USING btree ("watchlist_id");
CREATE TABLE "finatalk_login_attempt" (
	"email" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finatalk_analysis_user_symbol_title_uniq" ON "finatalk_analysis" USING btree ("user_id","symbol","title");--> statement-breakpoint
CREATE UNIQUE INDEX "finatalk_saved_chart_user_title_uniq" ON "finatalk_saved_chart" USING btree ("user_id","title");--> statement-breakpoint
CREATE UNIQUE INDEX "finatalk_portfolio_user_title_uniq" ON "finatalk_portfolio" USING btree ("user_id","title");--> statement-breakpoint
CREATE UNIQUE INDEX "finatalk_watchlist_user_uniq" ON "finatalk_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "finatalk_watchlist_item_watchlist_symbol_uniq" ON "finatalk_watchlist_item" USING btree ("watchlist_id","symbol");
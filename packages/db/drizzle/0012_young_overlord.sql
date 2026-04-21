ALTER TABLE "finatalk_alert" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "finatalk_alert" ADD COLUMN "asset_type" text;--> statement-breakpoint
ALTER TABLE "finatalk_alert" ADD COLUMN "strategy_kind" text;--> statement-breakpoint
ALTER TABLE "finatalk_alert" ADD COLUMN "portfolio_id" text;--> statement-breakpoint
ALTER TABLE "finatalk_alert" ADD CONSTRAINT "finatalk_alert_portfolio_id_finatalk_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."finatalk_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finatalk_alert_portfolio_idx" ON "finatalk_alert" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "finatalk_alert_source_idx" ON "finatalk_alert" USING btree ("source");
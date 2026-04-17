ALTER TABLE "finatalk_analysis" ADD COLUMN "range" text DEFAULT '1y' NOT NULL;--> statement-breakpoint
ALTER TABLE "finatalk_analysis" ADD COLUMN "interval" text DEFAULT '1d' NOT NULL;--> statement-breakpoint
ALTER TABLE "finatalk_analysis" ADD COLUMN "convert_to" text;
CREATE TABLE "finatalk_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"indicators" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_saved_chart" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"symbol" text NOT NULL,
	"range" text NOT NULL,
	"interval" text NOT NULL,
	"convert_to" text,
	"indicators" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finatalk_analysis" ADD CONSTRAINT "finatalk_analysis_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_saved_chart" ADD CONSTRAINT "finatalk_saved_chart_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finatalk_analysis_user_idx" ON "finatalk_analysis" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "finatalk_saved_chart_user_idx" ON "finatalk_saved_chart" USING btree ("user_id","created_at");
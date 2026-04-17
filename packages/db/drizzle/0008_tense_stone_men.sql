CREATE TABLE "finatalk_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"metadata" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finatalk_notification" ADD CONSTRAINT "finatalk_notification_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finatalk_notification_user_idx" ON "finatalk_notification" USING btree ("user_id","created_at");
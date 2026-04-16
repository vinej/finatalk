CREATE TABLE "finatalk_edgar_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finatalk_edgar_cache_expires_idx" ON "finatalk_edgar_cache" USING btree ("expires_at");
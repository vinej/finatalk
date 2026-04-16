CREATE TABLE "finatalk_holding" (
	"id" text PRIMARY KEY NOT NULL,
	"portfolio_id" text NOT NULL,
	"symbol" text NOT NULL,
	"quantity" numeric(24, 8) NOT NULL,
	"cost_basis" numeric(24, 8) NOT NULL,
	"purchase_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_portfolio" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finatalk_holding" ADD CONSTRAINT "finatalk_holding_portfolio_id_finatalk_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."finatalk_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_portfolio" ADD CONSTRAINT "finatalk_portfolio_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finatalk_holding_portfolio_idx" ON "finatalk_holding" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "finatalk_portfolio_user_idx" ON "finatalk_portfolio" USING btree ("user_id","created_at");
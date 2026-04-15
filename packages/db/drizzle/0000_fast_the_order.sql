CREATE TABLE "finatalk_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "finatalk_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "finatalk_two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text,
	"backup_codes" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finatalk_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "finatalk_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "finatalk_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "finatalk_account" ADD CONSTRAINT "finatalk_account_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_session" ADD CONSTRAINT "finatalk_session_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finatalk_two_factor" ADD CONSTRAINT "finatalk_two_factor_user_id_finatalk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."finatalk_user"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"messages" jsonb NOT NULL,
	"is_complete" boolean DEFAULT false,
	"tour_booked" boolean DEFAULT false,
	"contact_email" varchar,
	"contact_name" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "churn_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"staff_id" varchar,
	"subject" varchar NOT NULL,
	"content" text NOT NULL,
	"risk_level" varchar NOT NULL,
	"current_risk_band" varchar NOT NULL,
	"previous_risk_band" varchar,
	"member_profile" jsonb NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"points" integer NOT NULL,
	"category" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"offer_id" uuid NOT NULL,
	"points_spent" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outreach_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"staff_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'member' NOT NULL,
	"membership_type" varchar DEFAULT 'basic',
	"loyalty_points" integer DEFAULT 1250,
	"join_date" timestamp DEFAULT now(),
	"last_visit" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"goals" text NOT NULL,
	"weekly_schedule" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "churn_emails" ADD CONSTRAINT "churn_emails_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "churn_emails" ADD CONSTRAINT "churn_emails_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "churn_emails" ADD CONSTRAINT "churn_emails_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_redemptions" ADD CONSTRAINT "offer_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_redemptions" ADD CONSTRAINT "offer_redemptions_offer_id_loyalty_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."loyalty_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_actions" ADD CONSTRAINT "outreach_actions_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_actions" ADD CONSTRAINT "outreach_actions_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
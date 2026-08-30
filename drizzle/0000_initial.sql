CREATE TYPE "public"."schedule_item_status" AS ENUM('confirmed', 'to_be_confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."schedule_item_type" AS ENUM('registration', 'opening', 'talk', 'roundtable', 'panel', 'discussion', 'break', 'lunch', 'visit', 'closing');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
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
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"heading_bg" text,
	"heading_en" text,
	"content_bg" jsonb,
	"content_en" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation_items" (
	"id" text PRIMARY KEY NOT NULL,
	"label_bg" text NOT NULL,
	"label_en" text NOT NULL,
	"href" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt_bg" text,
	"alt_en" text,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"media_id" text,
	"url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_days" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"title_bg" text NOT NULL,
	"title_en" text NOT NULL,
	"subtitle_bg" text,
	"subtitle_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_item_speakers" (
	"item_id" text NOT NULL,
	"speaker_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "schedule_item_speakers_item_id_speaker_id_pk" PRIMARY KEY("item_id","speaker_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" text PRIMARY KEY NOT NULL,
	"day_id" text NOT NULL,
	"panel_id" text,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"item_type" "schedule_item_type" NOT NULL,
	"title_bg" text NOT NULL,
	"title_en" text NOT NULL,
	"description_bg" text,
	"description_en" text,
	"status" "schedule_item_status" DEFAULT 'confirmed' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_panels" (
	"id" text PRIMARY KEY NOT NULL,
	"day_id" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"title_bg" text NOT NULL,
	"title_en" text NOT NULL,
	"description_bg" text,
	"description_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" text PRIMARY KEY NOT NULL,
	"name_bg" text NOT NULL,
	"name_en" text NOT NULL,
	"affiliation_bg" text,
	"affiliation_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"timezone" text DEFAULT 'Europe/Sofia' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"city_bg" text DEFAULT 'София' NOT NULL,
	"city_en" text DEFAULT 'Sofia' NOT NULL,
	"venue_name_bg" text,
	"venue_name_en" text,
	"venue_address_bg" text,
	"venue_address_en" text,
	"map_url" text,
	"venue_published" boolean DEFAULT false NOT NULL,
	"contact_email" text,
	"facebook_url" text,
	"linkedin_url" text,
	"ngo_home_url" text,
	"chitalishta_map_url" text,
	"grants_url" text,
	"data_url" text,
	"footer_blurb_bg" text,
	"footer_blurb_en" text,
	"copyright_bg" text,
	"copyright_en" text,
	"english_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton_chk" CHECK ("site_settings"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_item_speakers" ADD CONSTRAINT "schedule_item_speakers_item_id_schedule_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."schedule_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_item_speakers" ADD CONSTRAINT "schedule_item_speakers_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_day_id_schedule_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."schedule_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_panel_id_schedule_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."schedule_panels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_panels" ADD CONSTRAINT "schedule_panels_day_id_schedule_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."schedule_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_unique" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_normalized_idx" ON "user" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "content_sections_slug_idx" ON "content_sections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_sections_visible_sort_idx" ON "content_sections" USING btree ("visible","sort_order");--> statement-breakpoint
CREATE INDEX "navigation_items_visible_sort_idx" ON "navigation_items" USING btree ("visible","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_blob_pathname_idx" ON "media_assets" USING btree ("blob_pathname");--> statement-breakpoint
CREATE INDEX "media_assets_created_by_idx" ON "media_assets" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "partners_visible_sort_idx" ON "partners" USING btree ("visible","sort_order");--> statement-breakpoint
CREATE INDEX "partners_media_id_idx" ON "partners" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "schedule_days_sort_idx" ON "schedule_days" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "schedule_days_visible_sort_idx" ON "schedule_days" USING btree ("visible","sort_order");--> statement-breakpoint
CREATE INDEX "schedule_item_speakers_item_sort_idx" ON "schedule_item_speakers" USING btree ("item_id","sort_order");--> statement-breakpoint
CREATE INDEX "schedule_items_day_sort_idx" ON "schedule_items" USING btree ("day_id","sort_order");--> statement-breakpoint
CREATE INDEX "schedule_items_panel_sort_idx" ON "schedule_items" USING btree ("panel_id","sort_order");--> statement-breakpoint
CREATE INDEX "schedule_items_visible_day_idx" ON "schedule_items" USING btree ("visible","day_id","sort_order");--> statement-breakpoint
CREATE INDEX "schedule_panels_day_sort_idx" ON "schedule_panels" USING btree ("day_id","sort_order");
CREATE TYPE "public"."privacy_mode" AS ENUM('public', 'on_demand', 'incognito');--> statement-breakpoint
CREATE TYPE "public"."activity_disclosure" AS ENUM('shared', 'pending', 'silent');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "privacy_mode" "privacy_mode" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "tracking_links" ADD COLUMN "disclosure" "activity_disclosure" DEFAULT 'shared' NOT NULL;--> statement-breakpoint
UPDATE "users" SET "privacy_mode" = 'incognito' WHERE "is_incognito" = true;--> statement-breakpoint
UPDATE "tracking_links" SET "disclosure" = 'silent' FROM "users" WHERE "tracking_links"."user_uuid" = "users"."uuid" AND "users"."privacy_mode" = 'incognito';

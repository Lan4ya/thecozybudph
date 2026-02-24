ALTER TABLE "carts" DROP CONSTRAINT "carts_one_per_profile";--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_product_collection_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "profile_id" uuid;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN "product_collection_id";--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_one_per_profile" UNIQUE("profile_id");
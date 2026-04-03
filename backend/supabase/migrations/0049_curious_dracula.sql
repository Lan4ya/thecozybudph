ALTER TABLE "addresses" RENAME COLUMN "product_collection_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_product_collection_id_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "idx_addresses_profile_id";--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_addresses_profile_id" ON "addresses" USING btree ("profile_id");
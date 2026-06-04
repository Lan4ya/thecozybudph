ALTER TABLE "addresses" ADD COLUMN "is_company_address" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "latitude" numeric(10, 7) NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "longitude" numeric(10, 7) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "exactly_one_global_company_address" ON "addresses" USING btree ((true)) WHERE "addresses"."is_company_address" = true;--> statement-breakpoint
ALTER POLICY "users can select own address" ON "addresses" RENAME TO "users can select own or company address";
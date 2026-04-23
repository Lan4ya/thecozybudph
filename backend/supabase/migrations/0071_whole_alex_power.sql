ALTER TABLE "payments" ALTER COLUMN "is_active" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "is_active" SET NOT NULL;
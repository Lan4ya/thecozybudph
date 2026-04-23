ALTER TABLE "payments" ALTER COLUMN "payment_intent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount_cents" DROP NOT NULL;
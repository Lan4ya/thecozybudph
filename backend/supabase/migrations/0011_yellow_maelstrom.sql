ALTER TABLE "cart_items" DROP CONSTRAINT "quantity_min_1";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "messages_not_exceed_quantity";--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "card_messages" SET DEFAULT ARRAY[]::varchar[];--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_min_1" CHECK ("cart_items"."quantity" >= 1);--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_messages_not_exceed_quantity" CHECK (card_messages IS NULL OR array_length("cart_items"."card_messages", 1) <= "cart_items"."quantity");
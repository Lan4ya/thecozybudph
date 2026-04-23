UPDATE orders
SET expires_at = created_at + interval '1 day'
WHERE expires_at IS NULL;

ALTER TABLE "orders" ALTER COLUMN "expires_at" SET NOT NULL;

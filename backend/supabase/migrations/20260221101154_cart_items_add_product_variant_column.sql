ALTER TABLE cart_items
ADD COLUMN product_variant jsonb NOT NULL DEFAULT '{}'::jsonb;

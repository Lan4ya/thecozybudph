DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'cart_items_unique_cart_product'
    ) THEN
        ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_unique_cart_product
        UNIQUE (cart_id, product_id);
    END IF;
END $$;





CREATE OR REPLACE FUNCTION upsert_cart_item(
  p_cart_id uuid,
  p_product_id uuid,
  p_quantity int
)
RETURNS TABLE (
  -- id uuid, <- NOTE: maybe return this too?? we'll see
  cart_id uuid,
  product_id uuid,
  quantity int
)
LANGUAGE sql
AS $$
  INSERT INTO cart_items (cart_id, product_id, quantity)
  VALUES (p_cart_id, p_product_id, p_quantity)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE
    SET quantity = cart_items.quantity + EXCLUDED.quantity
  RETURNING cart_items.cart_id, cart_items.product_id, cart_items.quantity;
$$;

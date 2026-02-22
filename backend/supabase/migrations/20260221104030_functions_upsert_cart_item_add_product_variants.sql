-- drop old fn
DROP FUNCTION IF EXISTS upsert_cart_item(uuid, uuid, int);


CREATE OR REPLACE FUNCTION upsert_cart_item(
  cart_id uuid,
  product_id uuid,
  quantity int,
  product_variant jsonb
)
RETURNS TABLE (
  product_id uuid,
  quantity int,
  product_variant jsonb
)
LANGUAGE sql
AS $$
  INSERT INTO cart_items (cart_id, product_id, quantity, product_variant)
  VALUES (cart_id, product_id, quantity, product_variant)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE
    SET quantity = cart_items.quantity + EXCLUDED.quantity
  RETURNING cart_items.product_id, cart_items.quantity, cart_items.product_variant;
$$;


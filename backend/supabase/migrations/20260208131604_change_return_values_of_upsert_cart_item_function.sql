DROP FUNCTION IF EXISTS upsert_cart_item(uuid, uuid, int);

-- Only return product_id and quantity
CREATE OR REPLACE FUNCTION upsert_cart_item(
  p_cart_id uuid,
  p_product_id uuid,
  p_quantity int
)
RETURNS TABLE (
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
  RETURNING cart_items.product_id, cart_items.quantity;
$$;

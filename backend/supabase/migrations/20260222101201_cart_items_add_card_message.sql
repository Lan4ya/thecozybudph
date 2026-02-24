ALTER TABLE cart_items
ADD COLUMN card_message VARCHAR(600);

-- drop old fn
DROP FUNCTION IF EXISTS upsert_cart_item(uuid, uuid, int, jsonb);


CREATE OR REPLACE FUNCTION upsert_cart_item(
  cart_id uuid,
  product_id uuid,
  quantity int,
  product_variant jsonb,
  card_message varchar DEFAULT NULL
)
RETURNS TABLE (
  product_id uuid,
  quantity int,
  product_variant jsonb,
  card_message varchar
)
LANGUAGE sql
AS $$
  INSERT INTO cart_items (cart_id, product_id, quantity, product_variant, card_message)
  VALUES (cart_id, product_id, quantity, product_variant, card_message)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE
    SET quantity = cart_items.quantity + EXCLUDED.quantity, card_message = EXCLUDED.card_message
  RETURNING cart_items.product_id, cart_items.quantity, cart_items.product_variant, cart_items.card_message;
$$;


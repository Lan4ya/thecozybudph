UPDATE payments p
SET is_active = false
WHERE id NOT IN (
  SELECT DISTINCT ON (order_id) id
  FROM payments
  ORDER BY order_id, created_at DESC
);


UPDATE payments p
SET profile_id = o.profile_id
FROM orders o
WHERE p.order_id = o.id
  AND p.profile_id IS NULL;

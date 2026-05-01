UPDATE orders o
SET pass_on_fee =
  CASE p.method
    WHEN 'brankas' THEN
      CEIL((o.total_cents + 1500)::numeric / (1 - 0.01))::int - o.total_cents

    WHEN 'gcash' THEN
      CEIL((o.total_cents)::numeric / (1 - 0.02))::int - o.total_cents

    ELSE 0
  END
FROM payments p
WHERE p.order_id = o.id
  AND o.pass_on_fee IS NULL;

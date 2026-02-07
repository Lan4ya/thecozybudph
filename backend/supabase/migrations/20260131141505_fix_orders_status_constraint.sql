UPDATE orders
SET status = 'awaiting_payment'
WHERE status = 'pending';




ALTER TABLE orders
DROP CONSTRAINT orders_status_check;




ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (
  status IN (
    'created',
    'awaiting_payment',
    'confirmed',
    'fulfilling',
    'fulfilled',
    'cancelled'
  )
);

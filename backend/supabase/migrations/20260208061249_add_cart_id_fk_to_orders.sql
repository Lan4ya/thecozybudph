ALTER TABLE orders
ADD COLUMN cart_id uuid NULL REFERENCES carts(id);

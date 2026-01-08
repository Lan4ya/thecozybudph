ALTER TABLE orders
  ADD COLUMN subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  ADD COLUMN discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  ADD COLUMN shipping_cents integer NOT NULL CHECK (shipping_cents >= 0),
  ADD COLUMN total_cents integer NOT NULL CHECK (total_cents >= 0);

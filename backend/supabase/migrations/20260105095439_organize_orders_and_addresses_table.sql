ALTER TABLE orders
  ADD COLUMN shipping_address_id UUID DEFAULT gen_random_uuid() NOT NULL;

ALTER TABLE orders
  ADD CONSTRAINT fk_shipping_address
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id);

ALTER TABLE orders
ALTER COLUMN profile_id SET NOT NULL;

ALTER TABLE orders
  DROP COLUMN shipping_address;

ALTER TABLE orders
  DROP COLUMN customer_email;

ALTER TABLE orders
  DROP COLUMN customer_phone;

ALTER TABLE orders
  DROP COLUMN customer_last_name;

ALTER TABLE orders
  DROP COLUMN customer_first_name;

ALTER TABLE orders
  DROP COLUMN total_cents;

ALTER TABLE orders
  DROP COLUMN discount_cents;

ALTER TABLE orders
  DROP COLUMN shipping_cents;

ALTER TABLE orders
  DROP COLUMN subtotal_cents;

ALTER TABLE orders
  DROP COLUMN billing_address;




ALTER TABLE addresses
    DROP COLUMN state;

ALTER TABLE addresses
    DROP COLUMN deleted_at;

ALTER TABLE addresses
    ADD COLUMN full_name text;

ALTER TABLE addresses
  ADD COLUMN region text;

ALTER TABLE addresses
  ADD COLUMN province text;

ALTER TABLE addresses
  ADD COLUMN barangay text;

ALTER TABLE addresses
  ADD COLUMN address_line text; -- street name, building, house number, and landmark

ALTER TABLE addresses
  ADD COLUMN phone_number text;

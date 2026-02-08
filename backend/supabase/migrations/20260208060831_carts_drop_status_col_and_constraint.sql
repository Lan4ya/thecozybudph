DROP INDEX IF EXISTS carts_one_open_cart_per_profile;

ALTER TABLE carts
DROP CONSTRAINT IF EXISTS carts_status_check;

ALTER TABLE carts
DROP COLUMN IF EXISTS status;


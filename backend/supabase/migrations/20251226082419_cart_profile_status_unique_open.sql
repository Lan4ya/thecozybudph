ALTER TABLE carts
ADD COLUMN profile_id uuid;

ALTER TABLE carts
ADD CONSTRAINT carts_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

UPDATE carts
SET profile_id = customer_id
WHERE profile_id IS NULL;

SELECT COUNT(*) AS missing_profiles
FROM carts
WHERE profile_id IS NULL;

ALTER TABLE carts
ALTER COLUMN profile_id SET NOT NULL;

ALTER TABLE carts
ADD COLUMN status text;

ALTER TABLE carts
ALTER COLUMN status SET NOT NULL;

ALTER TABLE carts
ADD CONSTRAINT carts_status_check
CHECK (status IN ('open', 'checked_out', 'abandoned'));

CREATE UNIQUE INDEX carts_one_open_cart_per_profile
ON carts(profile_id)
WHERE status = 'open';

ALTER TABLE carts
DROP COLUMN customer_id;

ALTER TABLE carts
RENAME CONSTRAINT carts_profile_id_fkey
TO carts_profile_fkey;

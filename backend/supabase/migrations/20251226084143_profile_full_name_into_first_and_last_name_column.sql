ALTER TABLE profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

ALTER TABLE profiles
DROP COLUMN full_name;

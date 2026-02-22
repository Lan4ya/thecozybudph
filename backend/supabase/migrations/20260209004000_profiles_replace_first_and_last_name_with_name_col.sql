ALTER TABLE profiles 
DROP COLUMN first_name,
DROP COLUMN last_name,
ADD COLUMN name VARCHAR(255);

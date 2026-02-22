-- No longer needed since there's a more efficient way to auth user role now
ALTER TABLE profiles 
DROP COLUMN role;

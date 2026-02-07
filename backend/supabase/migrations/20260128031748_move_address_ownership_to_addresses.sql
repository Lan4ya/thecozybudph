ALTER TABLE addresses
ADD COLUMN profile_id uuid;



UPDATE addresses a
SET profile_id = p.id
FROM profiles p
WHERE p.address_id = a.id;



ALTER TABLE addresses
ALTER COLUMN profile_id SET NOT NULL;



ALTER TABLE addresses
ADD CONSTRAINT addresses_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES profiles(id)
ON DELETE CASCADE;



CREATE INDEX idx_addresses_profile_id
ON addresses(profile_id);



ALTER TABLE profiles
DROP COLUMN address_id;

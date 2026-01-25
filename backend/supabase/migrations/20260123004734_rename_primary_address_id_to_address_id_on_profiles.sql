ALTER TABLE public.profiles
RENAME COLUMN primary_address_id TO address_id;

ALTER TABLE public.profiles
RENAME CONSTRAINT profiles_primary_address_id_fkey
TO profiles_address_id_fkey;


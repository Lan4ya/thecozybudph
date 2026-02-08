-- A trigger function that inserts a profile and cart in DB after user signs up
-- or more specifically after auth.user insertion
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" 
    SECURITY DEFINER
    SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

-- INFO: Although we're gonna insert auth.users.id in carts.profile_id,
-- this is fine since auth.users.id === profile_id. 
  INSERT INTO carts(profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  return NEW;
end;
$$;




-- Execute handle_new_user on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




-- 1 profile = 1 cart always
ALTER TABLE carts
ADD CONSTRAINT carts_one_per_profile UNIQUE (profile_id);

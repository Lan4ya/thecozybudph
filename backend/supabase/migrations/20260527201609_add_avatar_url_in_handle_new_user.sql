CREATE OR REPLACE FUNCTION public.handle_new_user_operations()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  random_avatar_path TEXT;
BEGIN
  -- Grab a random avatar path from storage pool
  SELECT name INTO random_avatar_path
  FROM storage.objects
  WHERE bucket_id = 'avatars' AND name LIKE '%.webp'
  ORDER BY random()
  LIMIT 1;

  IF random_avatar_path IS NULL THEN
    random_avatar_path := 'default-avatar.webp';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || 
                           jsonb_build_object('avatar_path', random_avatar_path)
  WHERE id = NEW.id;

  -- Map relational constraints now that the user safely exists
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.carts (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- TRIGGER CREATION
CREATE TRIGGER on_auth_user_created_after
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_operations();

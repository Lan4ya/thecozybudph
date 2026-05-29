-- Migration: create_storage_buckets
-- Description: Initializes storage buckets for avatars, products, events, and image_snapshots

-- Function to create a bucket if it doesn't exist
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(
  bucket_name TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  size_limit BIGINT DEFAULT 52428800, -- 50 MiB in bytes
  mime_types TEXT[] DEFAULT ARRAY['image/png', 'image/jpeg', 'image/webp']::TEXT[]
)
RETURNS VOID AS $$
BEGIN
  -- Insert the bucket if it doesn't exist, or update metadata if it does
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (bucket_name, bucket_name, is_public, size_limit, mime_types)
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END;
$$ LANGUAGE plpgsql;

-- Create individual buckets
SELECT create_bucket_if_not_exists('avatars', TRUE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp']);
SELECT create_bucket_if_not_exists('products', TRUE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp']);
SELECT create_bucket_if_not_exists('events', TRUE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp']);
SELECT create_bucket_if_not_exists('image_snapshots', TRUE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp']);

-- Add SELECT RLS policies for the buckets
DO $$ 
BEGIN
    -- Create policy for avatars
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for avatars'
    ) THEN
        CREATE POLICY "Public read access for avatars" ON storage.objects
          FOR SELECT USING (bucket_id = 'avatars');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow all for avatars'
    ) THEN
        CREATE POLICY "Allow all for avatars" ON storage.objects
          FOR ALL TO public USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
    END IF;

    -- Create policy for products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for products'
    ) THEN
        CREATE POLICY "Public read access for products" ON storage.objects
          FOR SELECT USING (bucket_id = 'products');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow all for products'
    ) THEN
        CREATE POLICY "Allow all for products" ON storage.objects
          FOR ALL TO public USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');
    END IF;

    -- Create policy for events
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for events'
    ) THEN
        CREATE POLICY "Public read access for events" ON storage.objects
          FOR SELECT USING (bucket_id = 'events');
    END IF;

    -- Create policy for image_snapshots
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for image_snapshots'
    ) THEN
        CREATE POLICY "Public read access for image_snapshots" ON storage.objects
          FOR SELECT USING (bucket_id = 'image_snapshots');
    END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS create_bucket_if_not_exists;

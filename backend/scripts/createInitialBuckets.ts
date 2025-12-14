import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Usage: cd backend && pnpx tsx createInitialBuckets.ts

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY...");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET_NAMES = ["products", "events"];

const createBucket = async (bucketName: string) => {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (error && error.message !== "Bucket already exists") {
    throw error;
  }

  console.log(`Bucket created or already exists: ${bucketName}`);
};

const createBuckets = async () =>
  await Promise.all(BUCKET_NAMES.map((n) => createBucket(n)));

createBuckets().catch(console.error);

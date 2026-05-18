import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET_NAMES = ["products", "events", "image_snapshots"];

const createBuckets = async () => {
  for (const bucketName of BUCKET_NAMES) {
    await createBucket(bucketName);
  }

  console.log("Bucket initialization complete.");
};

const createBucket = async (bucketName: string) => {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (!error) {
    console.log(`Created bucket: ${bucketName}`);
    return;
  }

  if ("statusCode" in error && Number(error.statusCode) === 409) {
    console.log(`Bucket already exists: ${bucketName}`);
    return;
  }

  throw error;
};

await Promise.all(BUCKET_NAMES.map((bucketName) => createBucket(bucketName)));

console.log("Bucket initialization complete.");

createBuckets().catch((err) => {
  console.error("Failed to initialize buckets:", err);
  process.exit(1);
});

import { supabase } from "./helpers/supabase.ts";

const BUCKETS = ["avatars", "products", "events", "image_snapshots", "assets"];

export async function initBuckets() {
  console.log("Initializing storage buckets...");

  for (const bucket of BUCKETS) {
    const { data: existingBucket } = await supabase.storage.getBucket(bucket);

    if (existingBucket) {
      console.log(`Bucket '${bucket}' already exists. Updating metadata...`);
      const { error } = await supabase.storage.updateBucket(bucket, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });
      if (error) {
        console.error(`Error updating bucket '${bucket}':`, error.message);
      }
    } else {
      console.log(`Creating bucket '${bucket}'...`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });
      if (error) {
        console.error(`Error creating bucket '${bucket}':`, error.message);
      }
    }
  }

  console.log("Storage buckets initialized successfully.");
}

if (process.argv[1] === import.meta.filename) {
  initBuckets().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

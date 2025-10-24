import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import mime from "mime";
import "dotenv/config";

// USAGE EXAMPLE: pnpm tsx </path/to/dir> <bucket-name> (this script assumes bucket already exists)

// --- CLI Arguments ---
const [, , bucketArg, dirArg] = process.argv;

if (!bucketArg || !dirArg) {
  console.error("❌ Usage: tsx scripts/seed-storage.ts <bucket> <folder>");
  process.exit(1);
}

const BUCKET = bucketArg;
const SEED_DIR = dirArg;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log(SUPABASE_SERVICE_KEY);
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

// --- Init Supabase ---
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, {
        ...init,
        // TS doesn’t know about duplex, so we assert as `any`
        ...(init?.body ? { duplex: "half" } : {}),
      } as any),
  },
});

// --- recursive file listing ---
async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

// --- Upload Helper ---
async function uploadFile(filePath: string, bucket: string): Promise<void> {
  const relativePath = path
    .relative(SEED_DIR, filePath)
    .split(path.sep)
    .join("/");

  const contentType = mime.getType(filePath) || "application/octet-stream";

  // Use a stream instead of reading the whole file into memory
  const stream = fsSync.createReadStream(filePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(relativePath, stream, {
      contentType,
    });

  if (error) {
    console.error(`❌ Failed to upload: ${relativePath}`, error.message);
  } else {
    console.log(`✅ Uploaded: ${data.path} (${contentType})`);
  }
}

// --- Main Seeder ---
async function seedBucket(): Promise<void> {
  try {
    await fs.access(SEED_DIR);
  } catch {
    console.error(`❌ Folder not found: ${SEED_DIR}`);
    process.exit(1);
  }

  const files = await getAllFiles(SEED_DIR);

  console.log(
    `🌱 Uploading ${files.length} file(s) to bucket '${BUCKET}'...\n`,
  );

  // limit concurrency (e.g., 5 uploads at once)
  const CONCURRENCY = 5;
  let active = 0;
  const queue: Promise<void>[] = [];

  for (const filePath of files) {
    const task = (async () => {
      active++;
      await uploadFile(filePath, BUCKET);
      active--;
    })();

    queue.push(task);

    if (active >= CONCURRENCY) {
      await Promise.race(queue);
    }
  }

  await Promise.all(queue);

  console.log("\nDone seeding bucket!");
}

// --- Run ---
seedBucket().catch((err: unknown) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

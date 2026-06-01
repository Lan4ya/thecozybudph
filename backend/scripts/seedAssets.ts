import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { convertToOptimalWebp } from "./helpers/convertToOptimalWebp.ts";
import { supabase } from "./helpers/supabase.ts";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".tiff"];

export async function seedAssets() {
  try {
    const assetsDir = path.join(
      import.meta.dirname,
      "data",
      "images",
      "assets",
    );

    if (!existsSync(assetsDir)) {
      throw new Error(`Directory not found at: ${assetsDir}`);
    }

    const files = await fs.readdir(assetsDir);
    console.log(
      `Found ${files.length} items in directory. Initializing concurrent optimization...`,
    );

    const limit = pLimit(3);

    const validFiles = files.filter((filename) => {
      const ext = path.extname(filename).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        console.log(`Skipping non-image file: ${filename}`);
        return false;
      }
      return true;
    });

    const uploadPromises = validFiles.map((filename) =>
      limit(async () => {
        const ext = path.extname(filename).toLowerCase();
        const rawAssetPath = path.join(assetsDir, filename);

        try {
          const stats = await fs.stat(rawAssetPath);
          const originalSizeKB = stats.size / 1024;

          // Optimize via Sharp
          const optimizedWebpBuffer = await convertToOptimalWebp(rawAssetPath, {
            quality: 85,
            effort: 5,
            keepMetadata: false,
          });

          const optimizedSizeKB = optimizedWebpBuffer.length / 1024;
          const baseName = path.basename(filename, ext);
          const targetFileName = `${baseName}.webp`;

          console.log(`\nOptimizing image: ${filename}...`);
          console.log(
            `  ↳ ${originalSizeKB.toFixed(2)} KB -> ${optimizedSizeKB.toFixed(2)} KB`,
          );

          // Upload buffer to Supabase Storage
          const { error } = await supabase.storage
            .from("assets")
            .upload(targetFileName, optimizedWebpBuffer, {
              contentType: "image/webp",
              upsert: true,
            });

          if (error) {
            console.error(`❌ Failed to upload ${filename}:`, error.message);
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("assets").getPublicUrl(targetFileName);
          console.log(`Success! Public URL: ${publicUrl}`);
        } catch (fileError) {
          console.error(`❌ Error processing file ${filename}:`, fileError);
        }
      }),
    );

    await Promise.all(uploadPromises);

    console.log("\nDone seeding all directory assets!");
  } catch (err) {
    console.error("Critical error running directory seeding:", err);
  }
}

if (process.argv[1] === import.meta.filename) {
  seedAssets().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

import type { SupabaseDB } from "@shared/types.d.ts";
import pLimit from "p-limit";
import { formatSupabasePublicUrl } from "@shared/utils/mod.ts";

export const ProductStorage = {
  deleteImages: async (
    supabaseService: SupabaseDB,
    bucket: string,
    paths: string[],
  ) => {
    const { error } = await supabaseService.storage.from(bucket).remove(paths);
    return error;
  },

  downloadImages: async (
    supabaseService: SupabaseDB,
    bucket: string,
    paths: string[],
  ) => {
    const limit = pLimit(10);
    const downloads = paths.map((path) =>
      limit(async () => {
        const { data, error } = await supabaseService.storage
          .from(bucket)
          .download(path);

        if (error) throw error;

        return data;
      }),
    );

    const blobs = await Promise.all(downloads);
    return blobs;
  },

  uploadImages: async (
    supabaseService: SupabaseDB,
    bucket: string,
    files: File[],
  ) => {
    const limit = pLimit(5);

    const uploads = files.map((file) =>
      limit(async () => {
        const path = crypto.randomUUID();

        // Compute hash
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hash = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const { error } = await supabaseService.storage
          .from(bucket)
          .upload(path, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabaseService.storage.from(bucket).getPublicUrl(path);

        return {
          path,
          url: formatSupabasePublicUrl(publicUrl),
          hash,
        };
      }),
    );

    const results = await Promise.all(uploads);

    const paths: string[] = [];
    const urls: string[] = [];
    const hashes: string[] = [];

    for (const r of results) {
      paths.push(r.path);
      urls.push(r.url);
      hashes.push(r.hash);
    }

    return {
      urls,
      hashes,
      cleanup: async () => {
        if (!paths.length) return;
        await ProductStorage.deleteImages(supabaseService, bucket, paths);
      },
    };
  },
};

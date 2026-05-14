import type { SupabaseDB } from "@shared/types.d.ts";
import pLimit from "p-limit";
import { formatSupabasePublicUrl, isDev } from "@shared/utils/mod.ts";

export const ProductStorage = {
  deleteImages: async (
    supabase: SupabaseDB,
    bucket: string,
    paths: string[],
  ) => {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    return error;
  },

  downloadImages: async (
    supabase: SupabaseDB,
    bucket: string,
    paths: string[],
  ) => {
    const limit = pLimit(10);
    const downloads = paths.map((path) =>
      limit(async () => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(path);

        if (error) throw error;

        return data;
      }),
    );

    const blobs = await Promise.all(downloads);
    return blobs;
  },

  uploadImages: async (supabase: SupabaseDB, bucket: string, files: File[]) => {
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

        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(path);

        return {
          path,
          url: formatSupabasePublicUrl(publicUrl, isDev),
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
        await ProductStorage.deleteImages(supabase, bucket, paths);
      },
    };
  },
};

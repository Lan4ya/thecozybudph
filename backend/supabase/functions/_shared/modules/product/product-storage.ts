import type { SupabaseType } from "@shared/types.d.ts";
import { isDev } from "../../utils/isDev.ts";

export const ProductStorage = {
  deleteImages: async (supabase: SupabaseType, paths: string[]) => {
    const { error } = await supabase.storage.from("products").remove(paths);
    return error;
  },

  uploadImages: async (
    supabase: SupabaseType,
    bucket: string,
    files: File[],
  ) => {
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${crypto.randomUUID()}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file);

        if (error) throw error;
        uploadedPaths.push(path);
      }

      let urls = uploadedPaths.map((path) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      });

      if (isDev) {
        // replace internal docker host + port with localhost mapped port so the browser can access it
        urls = urls.map((u) => u.replace("kong:8000", "127.0.0.1:54321"));
      }

      return {
        urls,
        cleanup: async () =>
          await supabase.storage.from(bucket).remove(uploadedPaths),
      };
    } catch (err) {
      // best-effort cleanup
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from(bucket)
          .remove(uploadedPaths)
          .catch(() => {});
      }

      throw err;
    }
  },
};

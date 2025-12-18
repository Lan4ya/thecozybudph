import type { SupabaseClient } from "supabase";

export const ProductStorage = {
  deleteImages: async (supabase: SupabaseClient, paths: string[]) => {
    const { error } = await supabase.storage.from("products").remove(paths);
    return error;
  },

  uploadImages: async (
    supabase: SupabaseClient,
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

      const urls = uploadedPaths.map((path) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      });

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

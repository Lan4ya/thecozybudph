import type { SupabaseClient } from "@supabase/supabase-js";
import { CustomError } from "./errors/CustomError.ts";

export const uploadImagesToDB = async (
  supabase: SupabaseClient,
  images: File[],
) => {
  const imageUploads = images.map(async (file) => {
    const filePath = `${crypto.randomUUID()}-${file.name}`;
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (uploadError) {
      throw new CustomError(
        500,
        `Failed to upload ${file.name}: ${uploadError.message}`,
      );
    }

    // dev log
    console.log(`Upload data: `, _uploadData);

    // Get the public URL for each image
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  });

  return await Promise.all(imageUploads);
};

import type { SupabaseType } from "../types.d.ts";
import { AppError } from "../errors/Errors.ts";

export const supabaseUploadImages = async (
  supabase: SupabaseType,
  bucket: string,
  images: File[],
): Promise<string[]> => {
  const imageUploads = images.map(async (file) => {
    const filePath = `${crypto.randomUUID()}`;
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw new AppError(
        500,
        `Failed to upload ${file.name}: ${uploadError.message}`,
      );
    }

    console.log(`Upload data: `, _uploadData);

    // Get the public URL for each image
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  });

  return await Promise.all(imageUploads);
};

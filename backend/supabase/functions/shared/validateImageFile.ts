import { fileTypeFromBuffer } from "file-type";
import { CustomError } from "./errors/CustomError.ts";

export const validateImageFile = async (imgFiles: File[]) => {
  const filteredImages = imgFiles.filter(
    (file) =>
      file instanceof File &&
      file.size > 0 &&
      file.name &&
      file.name !== "undefined" &&
      file.name !== "",
  );

  if (!filteredImages.length) {
    throw new CustomError(400, "No valid images uploaded");
  }

  // File size and type validation
  for (const imgFile of filteredImages) {
    // Check file size (50MB max per img)
    if (imgFile.size > 50 * 1024 * 1024) {
      throw new CustomError(
        413, // 413 Payload Too Large
        `File too large: ${imgFile.name}. Maximum size is 50MB.`,
      );
    }

    // Check if file is actually an image
    if (!imgFile.type.startsWith("image/")) {
      throw new CustomError(
        400,
        `Invalid file: ${imgFile.name}. Only image files are allowed.`,
      );
    }

    // SECURITY: imgFile.type CAN BE SPOOFED! SO we use file-type to detect actual file type from binary data
    const arrayBuffer = await imgFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) {
      throw new CustomError(
        400,
        `Unable to detect file type: ${imgFile.name}. File may be corrupted.`,
      );
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(detected.mime)) {
      throw new CustomError(
        415, // 415 Unsupported Media Type
        `Invalid file type: ${imgFile.name}. Detected as ${detected.mime}. Only PNG, JPEG, and WebP images are allowed.`,
      );
    }
  }
};

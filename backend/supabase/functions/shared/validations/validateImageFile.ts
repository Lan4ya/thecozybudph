import { fileTypeFromBuffer } from "file-type";
import { CustomError } from "../errors/CustomError.ts";

// SECURITY: imgFile.type can be spoofed! so we use file-type to detect
// actual file type from binary data

export const validateImageFile = async (imgFiles: File[]) => {
  for (const imgFile of imgFiles) {
    const arrayBuffer = await imgFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) {
      throw new CustomError(
        400,
        `Unable to detect file type: ${imgFile.name}. File may be corrupted.`,
      );
    }
  }
};

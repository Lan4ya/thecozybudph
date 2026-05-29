import sharp, { Sharp, WebpOptions } from "sharp";

interface OptimizationOptions {
  quality?: number;
  effort?: number;
  keepMetadata?: boolean;
}

/**
 * Converts an image file or buffer to an optimized WebP.
 * Automatically handles photographs (lossy) vs graphics elegantly.
 */
export async function convertToOptimalWebp(
  inputSource: string | Buffer,
  options: OptimizationOptions = {},
): Promise<Buffer> {
  const { quality = 80, effort = 4, keepMetadata = false } = options;

  try {
    let pipeline: Sharp = sharp(inputSource);

    pipeline = pipeline.rotate();

    const webpConfig: WebpOptions = {
      quality: quality,
      effort: effort,
      smartSubsample: true, // Reduces color bleeding on edges
    };

    pipeline = pipeline.webp(webpConfig);

    if (!keepMetadata) {
      pipeline = pipeline.withMetadata();
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error("Failed to compress and convert image:", error);
    throw error;
  }
}

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import ImageWorker from "../workers/imageWorker?worker";

interface CompressProgress {
  index: number;
  total: number;
  progress: number; // 0-100
}

interface UseImageCompressorReturn {
  compressImages: (files: File[]) => Promise<File[]>;
  progress: CompressProgress | null;
}

const canUseOffscreen =
  typeof OffscreenCanvas !== "undefined" &&
  typeof OffscreenCanvas.prototype.convertToBlob === "function";

export function useImageCompressor(): UseImageCompressorReturn {
  const [progress, setProgress] = useState<CompressProgress | null>(null);

  const compressImages = useCallback(async (files: File[]): Promise<File[]> => {
    const concurrency = 3;
    const results: File[] = [];
    let i = 0;

    async function worker(): Promise<void> {
      while (i < files.length) {
        const index = i++;
        const file = files[index];

        try {
          const processedFile = canUseOffscreen
            ? await processWithWorker(file)
            : await processWithBrowserImageCompression(file);

          results[index] = processedFile;
        } catch {
          results[index] = file; // fallback to original
        }

        setProgress({
          index: index + 1,
          total: files.length,
          progress: ((index + 1) / files.length) * 100,
        });
      }
    }

    // Launch N concurrent "threads"
    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    setProgress(null); // reset
    return results;
  }, []);

  return { compressImages, progress };
}

/* ---------------- Helper Functions ---------------- */

async function processWithWorker(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const worker = new ImageWorker();
    const id = crypto.randomUUID();

    worker.onmessage = (
      e: MessageEvent<{
        id: string;
        success: boolean;
        buffer?: ArrayBuffer;
        error?: string;
      }>,
    ) => {
      if (e.data.id !== id) return;
      worker.terminate();

      if (e.data.success) {
        resolve(
          new File([e.data.buffer!], file.name.replace(/\.\w+$/, ".webp"), {
            type: "image/webp",
            lastModified: Date.now(),
          }),
        );
      } else {
        reject(new Error(e.data.error));
      }
    };

    file.arrayBuffer().then((buffer) => {
      worker.postMessage({ id, buffer, type: file.type }, [buffer]);
    });
  });
}

async function processWithBrowserImageCompression(file: File): Promise<File> {
  const blob = await imageCompression(file, {
    maxWidthOrHeight: 700,
    useWebWorker: true,
    initialQuality: 0.9,
    fileType: "image/webp",
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

// tells ts compiler that this file is a Web Worker, not a normal window/browser context so it doens't comaplain.
/// <reference lib="webworker" />

interface WorkerInput {
  id: string;
  buffer: ArrayBuffer;
  type: string;
}

interface WorkerOutputSuccess {
  id: string;
  success: true;
  buffer: ArrayBuffer;
}

interface WorkerOutputError {
  id: string;
  success: false;
  error: string;
}

export type ImageCompressorWorkerOutput =
  | WorkerOutputSuccess
  | WorkerOutputError;

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { id, buffer, type } = e.data;

  try {
    const blob = new Blob([buffer], { type });
    const bitmap = await createImageBitmap(blob);

    const maxDimension = 1280;
    const scale = Math.min(
      maxDimension / bitmap.width,
      maxDimension / bitmap.height,
    );

    const canvas = new OffscreenCanvas(
      bitmap.width * scale,
      bitmap.height * scale,
    );
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");

    ctx.drawImage(bitmap, 0, 0);

    const outBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.9,
    });

    const outBuffer = await outBlob.arrayBuffer();

    const message: WorkerOutputSuccess = {
      id,
      success: true,
      buffer: outBuffer,
    };

    self.postMessage(message, [outBuffer]);
  } catch (err: any) {
    const message: WorkerOutputError = {
      id,
      success: false,
      error: err?.message || "Unknown error",
    };
    self.postMessage(message);
  }
};

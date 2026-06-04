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

const workerCtx = self as unknown as DedicatedWorkerGlobalScope;

workerCtx.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { id, buffer, type } = e.data;

  try {
    const blob = new Blob([buffer], { type });
    const bitmap = await createImageBitmap(blob);

    const maxDimension = 1280;
    const scale = Math.min(
      1, // never upscale
      maxDimension / bitmap.width,
      maxDimension / bitmap.height,
    );

    const canvasWidth = bitmap.width * scale;
    const canvasHeight = bitmap.height * scale;

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");

    ctx.drawImage(bitmap, 0, 0, canvasWidth, canvasHeight);

    const outBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 1,
    });

    const outBuffer = await outBlob.arrayBuffer();

    const message: WorkerOutputSuccess = {
      id,
      success: true,
      buffer: outBuffer,
    };

    workerCtx.postMessage(message, [outBuffer]);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    const message: WorkerOutputError = {
      id,
      success: false,
      error: errorMsg,
    };
    workerCtx.postMessage(message);
  }
};

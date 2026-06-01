/**
 * Ensures an asynchronous operation takes at least a target minimum duration
 * to prevent user enumeration via timing side-channel attacks.
 * * @param startTime - The performance.now() timestamp captured at the start of the operation
 * @param targetDelayMs - The minimum duration floor in milliseconds (default: 60)
 */
export const stabilizeTiming = async (
  startTime: number,
  targetDelayMs: number = 60,
): Promise<void> => {
  const executionTime = performance.now() - startTime;

  if (executionTime < targetDelayMs) {
    await new Promise((resolve) =>
      setTimeout(resolve, targetDelayMs - executionTime),
    );
  }
};

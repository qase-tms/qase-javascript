/**
 * Default number of test results per upload batch.
 * Used by TestOpsReporter and TestOpsMultiReporter when no explicit batch size is configured.
 */
export const DEFAULT_BATCH_SIZE = 200;

const MAX_BATCH_SIZE = 200;

/**
 * The API accepts at most 200 results per request, and a size below 1 would send empty batches.
 */
export const resolveBatchSize = (size: number | undefined): number => {
  if (typeof size !== 'number' || !Number.isFinite(size)) return DEFAULT_BATCH_SIZE;
  return Math.min(MAX_BATCH_SIZE, Math.max(1, Math.trunc(size)));
};

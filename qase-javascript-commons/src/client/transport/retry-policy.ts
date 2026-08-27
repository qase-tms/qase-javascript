import { isAxiosError } from '../../utils/is-axios-error';

/** Default number of extra attempts after the first one. */
export const DEFAULT_RETRIES = 3;
/** Default first backoff step, in milliseconds. */
export const DEFAULT_RETRY_BACKOFF_MS = 1000;
/** Upper bound for a single computed backoff step. */
export const MAX_BACKOFF_MS = 30_000;
/**
 * Upper bound for an honoured `Retry-After`. Qase asks for roughly 60 seconds; the cap only
 * exists so a hostile or mistaken header cannot park a CI job for hours.
 */
export const MAX_RETRY_AFTER_MS = 120_000;

/**
 * Statuses that fail identically on a second attempt, so retrying them only adds load:
 * malformed request, bad credentials, missing entity, oversized payload, quota exhausted.
 */
export const NON_RETRYABLE_STATUSES: readonly number[] = [400, 401, 403, 404, 413, 422, 507];

/**
 * @param {number} status
 * @returns {boolean} whether another attempt could plausibly succeed
 */
export const isRetryableStatus = (status: number): boolean => {
  if (NON_RETRYABLE_STATUSES.includes(status)) {
    return false;
  }
  return status === 408 || status === 429 || status >= 500;
};

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export const isRetryableError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  // No HTTP response at all: the request never completed (connection reset, DNS failure,
  // client-side timeout). Safe to repeat now that every result carries an idempotency key.
  if (status === undefined) {
    return true;
  }

  return isRetryableStatus(status);
};

/**
 * Reads `Retry-After` (delta-seconds or an HTTP-date) off an error response.
 *
 * @param {unknown} error
 * @returns {number | null} the requested wait in milliseconds, or null when absent/unusable
 */
export const getRetryAfterMs = (error: unknown): number | null => {
  if (!isAxiosError(error)) {
    return null;
  }

  const headers = error.response?.headers;
  if (!headers) {
    return null;
  }

  const raw: unknown = (headers as Record<string, unknown>)['retry-after'];
  if (raw === undefined || raw === null) {
    return null;
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return clampRetryAfter(raw * 1000);
  }

  if (typeof raw !== 'string') {
    return null;
  }

  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return clampRetryAfter(parseInt(trimmed, 10) * 1000);
  }

  const asDate = Date.parse(trimmed);
  if (!isNaN(asDate)) {
    return clampRetryAfter(asDate - Date.now());
  }

  return null;
};

const clampRetryAfter = (ms: number): number | null => {
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  return Math.min(ms, MAX_RETRY_AFTER_MS);
};

/**
 * Exponential backoff for the given zero-based attempt number.
 *
 * @param {number} attempt
 * @param {number} baseDelayMs
 * @param {number} maxDelayMs
 * @returns {number}
 */
export const computeBackoffMs = (
  attempt: number,
  baseDelayMs = DEFAULT_RETRY_BACKOFF_MS,
  maxDelayMs = MAX_BACKOFF_MS,
): number => Math.min(baseDelayMs * Math.pow(2, Math.max(0, attempt)), maxDelayMs);

/**
 * The wait before the next attempt. A `Retry-After` from the server always wins over the
 * computed ladder — Qase asks for roughly 60 seconds and a short ladder does not survive it.
 *
 * @param {number} attempt
 * @param {unknown} error
 * @param {number} baseDelayMs
 * @param {number} maxDelayMs
 * @returns {number}
 */
export const resolveDelayMs = (
  attempt: number,
  error: unknown,
  baseDelayMs = DEFAULT_RETRY_BACKOFF_MS,
  maxDelayMs = MAX_BACKOFF_MS,
): number => getRetryAfterMs(error) ?? computeBackoffMs(attempt, baseDelayMs, maxDelayMs);

export interface RetryOptions {
  /** Extra attempts after the first one. */
  retries?: number | undefined;
  /** First backoff step in milliseconds. */
  baseDelayMs?: number | undefined;
  /** Cap for a single computed backoff step. */
  maxDelayMs?: number | undefined;
  /** Called before every wait, for logging. */
  onRetry?: ((info: { attempt: number; delayMs: number; error: unknown }) => void) | undefined;
  /** Injectable for tests. */
  sleep?: ((ms: number) => Promise<void>) | undefined;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `op`, repeating it while the failure looks transient. Non-retryable failures and the
 * last attempt's failure are rethrown untouched.
 *
 * @param {() => Promise<T>} op
 * @param {RetryOptions} options
 * @returns {Promise<T>}
 */
export const withRetry = async <T>(op: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const retries = normalizeRetries(options.retries);
  const baseDelayMs = normalizeBackoff(options.baseDelayMs);
  const maxDelayMs = options.maxDelayMs ?? MAX_BACKOFF_MS;
  const sleep = options.sleep ?? defaultSleep;

  for (let attempt = 0; ; attempt++) {
    try {
      return await op();
    } catch (error) {
      if (attempt >= retries || !isRetryableError(error)) {
        throw error;
      }

      const delayMs = resolveDelayMs(attempt, error, baseDelayMs, maxDelayMs);
      const jittered = Math.floor(delayMs * (1 + Math.random() * 0.2));

      options.onRetry?.({ attempt: attempt + 1, delayMs: jittered, error });
      await sleep(jittered);
    }
  }
};

const normalizeRetries = (retries: number | undefined): number => {
  if (typeof retries !== 'number' || !Number.isFinite(retries) || retries < 0) {
    return DEFAULT_RETRIES;
  }
  return Math.trunc(retries);
};

const normalizeBackoff = (backoff: number | undefined): number => {
  if (typeof backoff !== 'number' || !Number.isFinite(backoff) || backoff <= 0) {
    return DEFAULT_RETRY_BACKOFF_MS;
  }
  return backoff;
};

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import { expect } from '@jest/globals';
import {
  computeBackoffMs,
  getRetryAfterMs,
  isRetryableError,
  isRetryableStatus,
  MAX_RETRY_AFTER_MS,
  resolveDelayMs,
  withRetry,
} from '../../../src/client/transport/retry-policy';

const httpError = (status: number, headers: Record<string, unknown> = {}): Error => {
  const error = new Error(`HTTP ${status}`) as Error & {
    isAxiosError: boolean;
    response: { status: number; headers: Record<string, unknown> };
  };
  error.isAxiosError = true;
  error.response = { status, headers };
  return error;
};

const networkError = (code: string): Error => {
  const error = new Error(code) as Error & { isAxiosError: boolean; code: string };
  error.isAxiosError = true;
  error.code = code;
  return error;
};

describe('retry policy classifier', () => {
  it.each([408, 429, 500, 502, 503, 504, 509, 599])('retries %i', (status) => {
    expect(isRetryableStatus(status)).toBe(true);
    expect(isRetryableError(httpError(status))).toBe(true);
  });

  it.each([400, 401, 403, 404, 413, 422, 507])('does not retry %i', (status) => {
    expect(isRetryableStatus(status)).toBe(false);
    expect(isRetryableError(httpError(status))).toBe(false);
  });

  it.each([200, 201, 301, 405, 409, 410, 418, 451])('does not retry %i either', (status) => {
    expect(isRetryableStatus(status)).toBe(false);
  });

  it.each(['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'EAI_AGAIN'])(
    'retries transport failure %s',
    (code) => {
      expect(isRetryableError(networkError(code))).toBe(true);
    },
  );

  it('does not retry a non-axios error', () => {
    expect(isRetryableError(new Error('boom'))).toBe(false);
    expect(isRetryableError('boom')).toBe(false);
  });
});

describe('Retry-After', () => {
  it('reads delta-seconds', () => {
    expect(getRetryAfterMs(httpError(429, { 'retry-after': '60' }))).toBe(60_000);
  });

  it('reads a numeric header value', () => {
    expect(getRetryAfterMs(httpError(429, { 'retry-after': 5 }))).toBe(5000);
  });

  it('reads an HTTP-date', () => {
    const in30s = new Date(Date.now() + 30_000).toUTCString();
    const parsed = getRetryAfterMs(httpError(429, { 'retry-after': in30s }));
    expect(parsed).not.toBeNull();
    expect(parsed).toBeGreaterThan(25_000);
    expect(parsed).toBeLessThanOrEqual(30_000);
  });

  it('caps an absurd value', () => {
    expect(getRetryAfterMs(httpError(429, { 'retry-after': '99999' }))).toBe(MAX_RETRY_AFTER_MS);
  });

  it('ignores a past date, an unparseable value and a missing header', () => {
    const past = new Date(Date.now() - 60_000).toUTCString();
    expect(getRetryAfterMs(httpError(429, { 'retry-after': past }))).toBeNull();
    expect(getRetryAfterMs(httpError(429, { 'retry-after': 'soon' }))).toBeNull();
    expect(getRetryAfterMs(httpError(429))).toBeNull();
  });

  it('overrides the computed backoff', () => {
    const withHeader = httpError(429, { 'retry-after': '60' });

    // The ladder would have asked for 1s on the first attempt.
    expect(computeBackoffMs(0, 1000)).toBe(1000);
    expect(resolveDelayMs(0, withHeader, 1000)).toBe(60_000);

    // ...and the ladder is used again as soon as the header is gone.
    expect(resolveDelayMs(0, httpError(429), 1000)).toBe(1000);
  });
});

describe('computeBackoffMs', () => {
  it('grows exponentially and saturates at the cap', () => {
    expect(computeBackoffMs(0, 1000)).toBe(1000);
    expect(computeBackoffMs(1, 1000)).toBe(2000);
    expect(computeBackoffMs(2, 1000)).toBe(4000);
    expect(computeBackoffMs(20, 1000)).toBe(30_000);
  });
});

describe('withRetry', () => {
  const sleep = (): Promise<void> => Promise.resolve();

  it('returns the first successful result without waiting', async () => {
    const op = jest.fn().mockResolvedValue('ok');
    const slept: number[] = [];

    await expect(withRetry(op, { sleep: (ms) => { slept.push(ms); return Promise.resolve(); } }))
      .resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
    expect(slept).toEqual([]);
  });

  it('retries a 503 and succeeds', async () => {
    const op = jest.fn()
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValue('ok');

    await expect(withRetry(op, { retries: 3, sleep })).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('gives up after the configured number of retries', async () => {
    const op = jest.fn().mockRejectedValue(httpError(500));

    await expect(withRetry(op, { retries: 2, sleep })).rejects.toThrow('HTTP 500');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-retryable status', async () => {
    const op = jest.fn().mockRejectedValue(httpError(422));

    await expect(withRetry(op, { retries: 5, sleep })).rejects.toThrow('HTTP 422');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('honours Retry-After over the backoff ladder', async () => {
    const slept: number[] = [];
    const op = jest.fn()
      .mockRejectedValueOnce(httpError(429, { 'retry-after': '60' }))
      .mockResolvedValue('ok');

    await withRetry(op, {
      retries: 3,
      baseDelayMs: 1000,
      sleep: (ms) => { slept.push(ms); return Promise.resolve(); },
    });

    expect(slept).toHaveLength(1);
    // 60s plus at most 20% jitter, and far above the 1s the ladder would have asked for.
    expect(slept[0]).toBeGreaterThanOrEqual(60_000);
    expect(slept[0]).toBeLessThanOrEqual(72_000);
  });

  it('reports every retry through onRetry', async () => {
    const onRetry = jest.fn();
    const op = jest.fn()
      .mockRejectedValueOnce(httpError(500))
      .mockRejectedValueOnce(httpError(500))
      .mockResolvedValue('ok');

    await withRetry(op, { retries: 3, baseDelayMs: 10, sleep, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry.mock.calls[0]?.[0]).toMatchObject({ attempt: 1 });
    expect(onRetry.mock.calls[1]?.[0]).toMatchObject({ attempt: 2 });
  });

  it('treats retries: 0 as no retry at all', async () => {
    const op = jest.fn().mockRejectedValue(httpError(503));

    await expect(withRetry(op, { retries: 0, sleep })).rejects.toThrow('HTTP 503');
    expect(op).toHaveBeenCalledTimes(1);
  });
});

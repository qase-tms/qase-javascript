import { expect } from '@jest/globals';
import { maskToken, sanitizeOptionsForLog } from '../../src/utils/token-masker';

describe('maskToken', () => {
  it('replaces characters with asterisks when token is 7 chars or shorter', () => {
    expect(maskToken('')).toBe('');
    expect(maskToken('abc')).toBe('***');
    expect(maskToken('abcdefg')).toBe('*******');
  });

  it('keeps first 3 + last 4 chars for longer tokens', () => {
    expect(maskToken('abcdefgh')).toBe('abc****efgh');
    expect(maskToken('abcdefghijklmno')).toBe('abc****lmno');
  });
});

describe('sanitizeOptionsForLog', () => {
  it('masks testops.api.token when present', () => {
    const input = {
      testops: { api: { token: 'abcdefghij', host: 'qase.io' } },
      other: 42,
    };
    const out = sanitizeOptionsForLog(input);
    expect(out.testops.api.token).toBe('abc****ghij');
    expect(out.testops.api.host).toBe('qase.io');
    expect(out.other).toBe(42);
  });

  it('returns deep clone — does not mutate input', () => {
    const input = { testops: { api: { token: 'abcdefghij' } } };
    const out = sanitizeOptionsForLog(input);
    expect(input.testops.api.token).toBe('abcdefghij');
    expect(out).not.toBe(input);
  });

  it('is a no-op when no token is present', () => {
    const input = { testops: { api: { host: 'qase.io' } }, mode: 'report' };
    const out = sanitizeOptionsForLog(input);
    expect(out).toEqual(input);
  });

  it('is a no-op when testops block is missing entirely', () => {
    const input = { mode: 'report' };
    const out = sanitizeOptionsForLog(input);
    expect(out).toEqual(input);
  });
});

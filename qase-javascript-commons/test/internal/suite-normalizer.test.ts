import { describe, expect, it } from '@jest/globals';
import { normalizeSuitePart } from '../../src/internal/suite-normalizer';

describe('normalizeSuitePart', () => {
  it('lowercases and replaces all whitespace with underscores', () => {
    expect(normalizeSuitePart('Login Flow')).toBe('login_flow');
  });

  it('replaces every whitespace character (tabs, multiple spaces)', () => {
    expect(normalizeSuitePart('a  b\tc')).toBe('a__b_c');
  });

  it('returns lowercased input for already-normalized strings', () => {
    expect(normalizeSuitePart('LOGIN')).toBe('login');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeSuitePart('')).toBe('');
  });
});

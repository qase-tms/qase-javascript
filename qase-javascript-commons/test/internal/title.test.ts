import { describe, expect, it } from '@jest/globals';
import { removeQaseIdsFromTitle } from '../../src/internal/title';

describe('removeQaseIdsFromTitle', () => {
  it('strips a single Qase ID with colon at end', () => {
    expect(removeQaseIdsFromTitle('login flow (Qase ID: 1)')).toBe('login flow');
  });

  it('strips a comma-separated id list at end', () => {
    expect(removeQaseIdsFromTitle('login flow (Qase ID: 1,2,3)')).toBe('login flow');
  });

  it('accepts the optional colon variant', () => {
    expect(removeQaseIdsFromTitle('login flow (Qase ID 42)')).toBe('login flow');
  });

  it('is case-insensitive', () => {
    expect(removeQaseIdsFromTitle('login flow (qase id: 7)')).toBe('login flow');
  });

  it('only strips the trailing match, not mid-title', () => {
    expect(removeQaseIdsFromTitle('foo (Qase ID: 1) bar')).toBe('foo (Qase ID: 1) bar');
  });

  it('returns the original title when nothing matches', () => {
    expect(removeQaseIdsFromTitle('plain title')).toBe('plain title');
  });

  it('trims trailing whitespace after removal', () => {
    expect(removeQaseIdsFromTitle('hello   (Qase ID: 9)')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(removeQaseIdsFromTitle('')).toBe('');
  });
});

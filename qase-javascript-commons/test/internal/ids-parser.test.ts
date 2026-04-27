import { describe, expect, it } from '@jest/globals';
import { parseQaseIdsFromString } from '../../src/internal/ids-parser';

describe('parseQaseIdsFromString', () => {
  it('parses a single id', () => {
    expect(parseQaseIdsFromString('42')).toEqual([42]);
  });

  it('parses a comma-separated list', () => {
    expect(parseQaseIdsFromString('1,2,3')).toEqual([1, 2, 3]);
  });

  it('trims whitespace around ids', () => {
    expect(parseQaseIdsFromString(' 1 , 2 , 3 ')).toEqual([1, 2, 3]);
  });

  it('skips entries that are not numeric', () => {
    expect(parseQaseIdsFromString('1,abc,3')).toEqual([1, 3]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseQaseIdsFromString('')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only string', () => {
    expect(parseQaseIdsFromString('   ')).toEqual([]);
  });
});

import { describe, expect, it, jest } from '@jest/globals';
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

  it('drops zero ids', () => {
    expect(parseQaseIdsFromString('1,0,2')).toEqual([1, 2]);
  });

  it('drops negative ids', () => {
    expect(parseQaseIdsFromString('1,-5,2')).toEqual([1, 2]);
  });

  it('returns empty array when only zero is given', () => {
    expect(parseQaseIdsFromString('0')).toEqual([]);
  });

  it('passes warnings to the provided logger', () => {
    const log = jest.fn();
    const logger = { log, logError: jest.fn(), logDebug: jest.fn() };
    parseQaseIdsFromString('1,0,2', logger);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]?.[0]).toContain('got "0"');
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { filterPositiveIds } from '../../src/internal/filter-positive-ids';

describe('filterPositiveIds', () => {
  it('returns the same array when all ids are positive', () => {
    expect(filterPositiveIds([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('drops zero ids', () => {
    expect(filterPositiveIds([1, 0, 2])).toEqual([1, 2]);
  });

  it('drops negative ids', () => {
    expect(filterPositiveIds([1, -5, 2])).toEqual([1, 2]);
  });

  it('drops NaN values', () => {
    expect(filterPositiveIds([1, Number.NaN, 2])).toEqual([1, 2]);
  });

  it('drops non-finite values', () => {
    expect(filterPositiveIds([1, Number.POSITIVE_INFINITY, 2])).toEqual([1, 2]);
  });

  it('returns empty array when every id is invalid', () => {
    expect(filterPositiveIds([0, -1, Number.NaN])).toEqual([]);
  });

  it('calls logger.log once per dropped non-positive id with the expected message', () => {
    const log = jest.fn();
    const logger = { log, logError: jest.fn(), logDebug: jest.fn() };

    filterPositiveIds([1, 0, -3, 2], logger);

    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenNthCalledWith(
      1,
      'Warning: Qase test case ID must be greater than 0, got "0". This ID will be ignored and the result will be sent without it.',
    );
    expect(log).toHaveBeenNthCalledWith(
      2,
      'Warning: Qase test case ID must be greater than 0, got "-3". This ID will be ignored and the result will be sent without it.',
    );
  });

  it('does not call logger.log for NaN or non-finite values', () => {
    const log = jest.fn();
    const logger = { log, logError: jest.fn(), logDebug: jest.fn() };

    filterPositiveIds([Number.NaN, Number.POSITIVE_INFINITY], logger);

    expect(log).not.toHaveBeenCalled();
  });

  it('falls back to console.warn when no logger is provided', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      filterPositiveIds([1, 0, 2]);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        '[qase] Warning: Qase test case ID must be greater than 0, got "0". This ID will be ignored and the result will be sent without it.',
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});

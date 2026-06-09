import { filterPositiveIds } from './filter-positive-ids';
import { LoggerInterface } from '../utils/logger';

/**
 * Parses a comma-separated string of Qase IDs into an array of numbers.
 * Whitespace around each entry is trimmed; non-numeric entries are skipped.
 * IDs that are not positive integers (<= 0) are filtered out with a warning.
 *
 * Examples: "1,2,3" → [1, 2, 3], "42" → [42], "" → [].
 */
export function parseQaseIdsFromString(
  value: string,
  logger?: LoggerInterface,
): number[] {
  if (!value?.trim()) {
    return [];
  }
  const parsed = value
    .split(',')
    .map((part) => parseInt(part.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  return filterPositiveIds(parsed, logger);
}

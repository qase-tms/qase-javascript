/**
 * Parses a comma-separated string of Qase IDs into an array of numbers.
 * Whitespace around each entry is trimmed; non-numeric entries are skipped.
 *
 * Examples: "1,2,3" → [1, 2, 3], "42" → [42], "" → [].
 */
export function parseQaseIdsFromString(value: string): number[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(',')
    .map((part) => parseInt(part.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

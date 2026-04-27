const QASE_ID_TRAILER_REGEXP = /\(Qase ID:? ([\d,]+)\)$/i;

/**
 * Strips a trailing `(Qase ID: 1,2,3)` (or `(Qase ID 1)` without colon) from a test title.
 * Returns the original title untouched if no match is found.
 */
export function removeQaseIdsFromTitle(title: string): string {
  const match = title.match(QASE_ID_TRAILER_REGEXP);
  if (match) {
    return title.replace(match[0], '').trimEnd();
  }
  return title;
}

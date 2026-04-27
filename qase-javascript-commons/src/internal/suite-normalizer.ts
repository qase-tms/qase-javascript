/**
 * Lowercases the input and replaces every whitespace character with an
 * underscore. Used by reporters to normalize suite/title segments before
 * passing them into `generateSignature`.
 */
export function normalizeSuitePart(value: string): string {
  return value.toLowerCase().replace(/\s/g, '_');
}

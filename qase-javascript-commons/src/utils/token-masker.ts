/**
 * Mask a token for safe logging.
 * Tokens with 7 chars or fewer are fully masked. Longer tokens expose only
 * the first 3 and last 4 characters.
 */
export function maskToken(token: string): string {
  if (token.length <= 7) {
    return '*'.repeat(token.length);
  }
  return `${token.slice(0, 3)}****${token.slice(-4)}`;
}

/**
 * Produce a deep-cloned copy of options with `testops.api.token` masked.
 * Safe to log — never mutates the input.
 */
export function sanitizeOptionsForLog<T>(options: T): T {
  const sanitized = JSON.parse(JSON.stringify(options)) as
    T & { testops?: { api?: { token?: string } } };
  if (sanitized.testops?.api?.token) {
    sanitized.testops.api.token = maskToken(sanitized.testops.api.token);
  }
  return sanitized as T;
}

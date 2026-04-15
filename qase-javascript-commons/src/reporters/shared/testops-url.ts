/**
 * Resolve the TestOps app URL from an API host.
 *
 * Rules:
 * - undefined / empty / "qase.io" → "https://app.qase.io"
 * - "api.domain"                  → "https://app.domain"
 * - anything else                 → "https://<host>"
 */
export function resolveTestOpsBaseUrl(host: string | undefined): string {
  if (!host || host === 'qase.io') {
    return 'https://app.qase.io';
  }
  return `https://${host.replace('api', 'app')}`;
}

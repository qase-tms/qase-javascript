import {
  apiLabelToApp,
  apiLabelToAppInUrl,
  isAbsoluteUrl,
  resolveClusterAppUrl,
  stripTrailingSlashes,
} from '../../utils/api-host';

/**
 * Resolve the TestOps app URL from an API host.
 *
 * Rules:
 * - undefined / empty / "qase.io"  → "https://app.qase.io"
 * - known cluster ("eu.qase.io")   → its app URL ("https://app-eu.qase.io")
 * - "http(s)://api.domain"         → "http(s)://app.domain"   (scheme and port preserved)
 * - "http(s)://domain"             → "http(s)://domain"        (used verbatim)
 * - "api.domain"                   → "https://app.domain"
 * - anything else                  → "https://<host>"
 */
export function resolveTestOpsBaseUrl(host: string | undefined): string {
  if (!host || host === 'qase.io') {
    return 'https://app.qase.io';
  }

  const clusterAppUrl = resolveClusterAppUrl(host);
  if (clusterAppUrl) {
    return clusterAppUrl;
  }

  // A host carrying a scheme is already a full URL — keep its scheme, port and path.
  if (isAbsoluteUrl(host)) {
    return apiLabelToAppInUrl(stripTrailingSlashes(host));
  }

  return `https://${apiLabelToApp(host)}`;
}

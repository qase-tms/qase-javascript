/**
 * Helpers for interpreting the `testops.api.host` option (`QASE_TESTOPS_API_HOST`).
 *
 * The option accepts two shapes:
 *
 * 1. A **host fragment** — the historical form. `example.qase.io` is interpolated into Qase's
 *    own URL convention, giving `https://api-example.qase.io/<version>`.
 * 2. A **full base URL** — anything carrying an `http://` or `https://` scheme is used verbatim.
 *    This is the only way to express a scheme, a port, or a path prefix, so it is what
 *    self-hosted deployments and local development need.
 */

const SCHEME_PATTERN = /^https?:\/\//i;

/**
 * True when the value is a full base URL rather than a host fragment.
 *
 * Deliberately NOT a `value is string` type predicate: failing this check does not mean the value
 * is not a string (`qase.io` is a perfectly good host fragment), and declaring it that way narrows
 * the negative branch to `undefined`, silently making the host-fragment path dead code to the
 * type checker. Callers guard truthiness themselves.
 */
export function isAbsoluteUrl(value: string): boolean {
  return SCHEME_PATTERN.test(value);
}

/**
 * Strips trailing slashes so a version or path segment can be appended directly.
 * `https://qase.internal/tms/` → `https://qase.internal/tms`
 */
export function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Rewrites a leading `api.` label to `app.`, matching Qase's hosting convention.
 *
 * Anchored to the first label on purpose: an unanchored substring replace corrupts any host that
 * merely contains the letters `api` (`capital.qase.io` → `capptal.qase.io`). Hosts that do not
 * start with `api.` are returned unchanged.
 */
export function apiLabelToApp(host: string): string {
  return host.replace(/^api\./i, 'app.');
}

/**
 * Same rewrite as {@link apiLabelToApp}, but for a value that still carries its scheme, so the
 * `api.` label is matched after `//` rather than at the start of the string.
 */
export function apiLabelToAppInUrl(url: string): string {
  return url.replace(/^(https?:\/\/)api\./i, '$1app.');
}

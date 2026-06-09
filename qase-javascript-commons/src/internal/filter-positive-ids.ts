import { LoggerInterface } from '../utils/logger';

/**
 * Filter a list of Qase test case IDs, dropping non-positive (<= 0) and
 * non-finite numbers. Each dropped non-positive ID produces a warning so
 * users can spot accidental "0" IDs in their test code.
 *
 * NaN and non-finite values are dropped silently — they come from upstream
 * parse failures (parseInt('abc') etc.) that are already handled at their
 * source and are not user-facing mistakes worth warning about.
 *
 * Warning routing:
 *   - if a logger is provided, it goes through logger.log (INFO level, since
 *     the LoggerInterface has no warn level);
 *   - otherwise, it falls back to console.warn with a "[qase] " prefix so the
 *     message still reaches the user.
 */
export function filterPositiveIds(
  ids: number[],
  logger?: LoggerInterface,
): number[] {
  const valid: number[] = [];
  for (const n of ids) {
    if (!Number.isFinite(n)) {
      continue;
    }
    if (n <= 0) {
      const message = `Warning: Qase test case ID must be greater than 0, got "${n}". This ID will be ignored and the result will be sent without it.`;
      if (logger) {
        logger.log(message);
      } else {
        console.warn(`[qase] ${message}`);
      }
      continue;
    }
    valid.push(n);
  }
  return valid;
}

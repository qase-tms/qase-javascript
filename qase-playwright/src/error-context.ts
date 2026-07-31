import { promises as fs } from 'fs';
import { TestResult } from '@playwright/test/reporter';

/**
 * Playwright >= 1.51 attaches the error-context.md it writes for a failed test under this name,
 * with contentType `text/markdown`.
 */
export const ERROR_CONTEXT_ATTACHMENT_NAME = 'error-context';

/**
 * Matches the server-side cap on `execution.error_context`. Truncating here keeps oversized page
 * snapshots from being rejected (or bloating the bulk request) while still sending what fits.
 */
export const ERROR_CONTEXT_MAX_LENGTH = 262144;

const TRUNCATION_NOTICE = (omitted: number): string =>
  `\n\n[truncated by qase reporter: ${omitted} characters omitted]`;

/**
 * Trims `content` to at most `limit` characters, leaving room for a marker so the reader can tell
 * the text is incomplete. The result is never longer than `limit`. Pure — no I/O.
 */
export function truncateErrorContext(
  content: string,
  limit = ERROR_CONTEXT_MAX_LENGTH,
): string {
  if (content.length <= limit) {
    return content;
  }

  // The marker's own length depends on the omitted count, which depends on how much we keep, so
  // settle it in a couple of passes — the digit count only ever shrinks the budget slightly.
  let keep = limit;
  let notice = '';

  for (let pass = 0; pass < 3; pass++) {
    notice = TRUNCATION_NOTICE(content.length - keep);
    const next = limit - notice.length;

    if (next === keep) {
      break;
    }

    keep = next;
  }

  // Degenerate case (a limit smaller than the marker itself): drop the marker rather than
  // overshoot the cap the server enforces.
  if (keep <= 0) {
    return content.slice(0, limit);
  }

  return content.slice(0, keep) + notice;
}

/**
 * Reads the error-context attachment for a finished test, if Playwright produced one.
 *
 * Returns null rather than throwing: a missing or unreadable file must never fail the result
 * submission. The attachment is left in place so it is still uploaded as a file as well.
 */
export async function readErrorContext(
  attachments: TestResult['attachments'],
  limit = ERROR_CONTEXT_MAX_LENGTH,
): Promise<string | null> {
  const attachment = attachments.find(
    (item) => item.name === ERROR_CONTEXT_ATTACHMENT_NAME,
  );

  if (!attachment) {
    return null;
  }

  try {
    const content = attachment.body
      ? attachment.body.toString('utf8')
      : await readFile(attachment.path);

    if (content === null || content === '') {
      return null;
    }

    return truncateErrorContext(content, limit);
  } catch {
    return null;
  }
}

async function readFile(path: string | undefined): Promise<string | null> {
  if (!path) {
    return null;
  }

  return fs.readFile(path, 'utf8');
}

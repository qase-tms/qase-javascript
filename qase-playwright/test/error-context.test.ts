/* eslint-disable */
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { TestResult } from '@playwright/test/reporter';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import {
  ERROR_CONTEXT_ATTACHMENT_NAME,
  ERROR_CONTEXT_MAX_LENGTH,
  readErrorContext,
  truncateErrorContext,
} from '../src/error-context';

type Attachment = TestResult['attachments'][number];

function attachment(overrides: Partial<Attachment>): Attachment {
  return {
    name: ERROR_CONTEXT_ATTACHMENT_NAME,
    contentType: 'text/markdown',
    ...overrides,
  } as Attachment;
}

describe('truncateErrorContext', () => {
  it('returns content untouched when it is under the limit', () => {
    expect(truncateErrorContext('short', 100)).toBe('short');
  });

  it('returns content untouched when it is exactly at the limit', () => {
    const content = 'x'.repeat(50);
    expect(truncateErrorContext(content, 50)).toBe(content);
  });

  it('truncates and appends a marker when one character over the limit', () => {
    const content = 'x'.repeat(201);
    const result = truncateErrorContext(content, 200);

    expect(result.length).toBeLessThanOrEqual(200);
    expect(result).toContain('truncated by qase reporter');

    // The reported count must account for the room the marker itself took, i.e.
    // kept prefix + omitted === original length.
    const omitted = Number(/(\d+) characters omitted/.exec(result)![1]);
    const kept = result.slice(0, result.indexOf('\n\n[truncated')).length;
    expect(kept + omitted).toBe(content.length);
  });

  it('drops the marker rather than overshooting when the limit is smaller than the marker', () => {
    const result = truncateErrorContext('x'.repeat(100), 10);

    expect(result).toBe('x'.repeat(10));
    expect(result.length).toBe(10);
  });

  it('never exceeds the limit even for very large input', () => {
    const result = truncateErrorContext('y'.repeat(5000), 200);

    expect(result.length).toBeLessThanOrEqual(200);
    expect(result).toContain('truncated by qase reporter');
  });

  it('defaults to the server-side cap', () => {
    expect(ERROR_CONTEXT_MAX_LENGTH).toBe(262144);
    expect(
      truncateErrorContext('z'.repeat(ERROR_CONTEXT_MAX_LENGTH + 10)).length,
    ).toBeLessThanOrEqual(ERROR_CONTEXT_MAX_LENGTH);
  });
});

describe('readErrorContext', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'qase-error-context-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null when there is no error-context attachment', async () => {
    const attachments = [
      attachment({ name: 'screenshot', contentType: 'image/png' }),
    ];

    await expect(readErrorContext(attachments)).resolves.toBeNull();
  });

  it('returns null for an empty attachment list', async () => {
    await expect(readErrorContext([])).resolves.toBeNull();
  });

  it('reads from body when present', async () => {
    const attachments = [attachment({ body: Buffer.from('# from body\n') })];

    await expect(readErrorContext(attachments)).resolves.toBe('# from body\n');
  });

  it('reads from path when body is absent, preserving content byte for byte', async () => {
    const file = path.join(dir, 'error-context.md');
    // Trailing newline and fences must survive — the value is copied out as raw text.
    const content = '# Test info\n\n```yaml\n- button "Save"\n```\n';
    writeFileSync(file, content, 'utf8');

    await expect(readErrorContext([attachment({ path: file })])).resolves.toBe(
      content,
    );
  });

  it('returns null when the file is missing rather than throwing', async () => {
    const missing = path.join(dir, 'does-not-exist.md');

    await expect(
      readErrorContext([attachment({ path: missing })]),
    ).resolves.toBeNull();
  });

  it('returns null when the attachment has neither body nor path', async () => {
    await expect(readErrorContext([attachment({})])).resolves.toBeNull();
  });

  it('returns null for an empty file', async () => {
    const file = path.join(dir, 'empty.md');
    writeFileSync(file, '', 'utf8');

    await expect(
      readErrorContext([attachment({ path: file })]),
    ).resolves.toBeNull();
  });

  it('truncates oversized file content', async () => {
    const file = path.join(dir, 'big.md');
    writeFileSync(file, 'a'.repeat(500), 'utf8');

    const result = await readErrorContext([attachment({ path: file })], 100);

    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(100);
    expect(result).toContain('truncated by qase reporter');
  });
});

import test from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { PlaywrightQaseReporter } from './reporter';
import * as path from 'path';
import { getMimeTypes } from 'qase-javascript-commons';

export const ReporterContentType = 'application/qase.metadata+json';
const defaultContentType = 'application/octet-stream';

export interface MetadataMessage {
  ids?: number[];
  title?: string;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  ignore?: boolean;
  suite?: string;
  comment?: string;
}

/**
 * Use `qase.id()` instead. This method is deprecated and kept for reverse compatibility.
 *
 * @param caseId
 * @param name
 * @example
 * test(qase(1, 'test'), async ({ page }) => {
 *  await page.goto('https://example.com');
 * });
 * @returns {string}
 */
export const qase = (
  caseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];
  const ids: number[] = [];

  for (const id of caseIds) {
    if (typeof id === 'number') {
      ids.push(id);
      continue;
    }

    const parsedId = parseInt(id);

    if (!isNaN(parsedId)) {
      ids.push(parsedId);
      continue;
    }

    console.log(`qase: qase ID ${id} should be a number`);
  }

  PlaywrightQaseReporter.addIds(ids, name);

  return `${name}`;
};

/**
 * Set IDs for the test case
 *
 * @param {number | number[]} value
 *
 * @example
 * test('test', async ({ page }) => {
 *    qase.id(1);
 *    await page.goto('https://example.com');
 * });
 *
 */
qase.id = function(value: number | number[]) {
  addMetadata({
    ids: Array.isArray(value) ? value : [value],
  });
  return this;
};

/**
 * Set a title for the test case
 * @param {string} value
 * @example
 * test('test', async ({ page }) => {
 *    qase.title("Title");
 *    await page.goto('https://example.com');
 * });
 */
qase.title = function(value: string) {
  addMetadata({
    title: value,
  });
  return this;
};

/**
 * Set fields for the test case
 * @param {Record<string, string>[]} values
 * @example
 * test('test', async ({ page }) => {
 *    qase.fields({ 'severity': 'high', 'priority': 'medium' });
 *    await page.goto('https://example.com');
 * });
 */
qase.fields = function(values: Record<string, string>) {
  const stringRecord: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    stringRecord[String(key)] = String(value);
  }

  addMetadata({
    fields: stringRecord,
  });
  return this;
};

/**
 * Set parameters for the test case
 * @param {Record<string, string>[]} values
 * @example
 * for (const value of values) {
 *    test('test', async ({ page }) => {
 *      qase.parameters({ 'parameter': value });
 *      await page.goto('https://example.com');
 *    });
 * )
 */
qase.parameters = function(values: Record<string, string>) {
  const stringRecord: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    stringRecord[String(key)] = String(value);
  }
  addMetadata({
    parameters: stringRecord,
  });
  return this;
};

/**
 * Attach a file to the test case or the step
 * @param attach
 * @example
 * test('test', async ({ page }) => {
 *   qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
 *   qase.attach({ paths: '/path/to/file'});
 *   qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
 *   await page.goto('https://example.com');
 *  });
 */
qase.attach = function(attach: {
  name?: string,
  paths?: string | string[],
  content?: Buffer | string,
  contentType?: string,
}) {
  if (attach.paths !== undefined) {
    const files = Array.isArray(attach.paths) ? attach.paths : [attach.paths];

    for (const file of files) {
      const attachmentName = path.basename(file);
      const contentType: string = getMimeTypes(file);
      addAttachment(attachmentName, contentType, file);
    }

    return this;
  }
  const attachmentName = attach.name ?? 'attachment';
  const contentType = attach.contentType ?? defaultContentType;
  addAttachment(attachmentName, contentType, undefined, attach.content);

  return this;
};

/**
 * Ignore the test case result in Qase
 * @example
 * test('test', async ({ page }) => {
 *   qase.ignore();
 *   await page.goto('https://example.com');
 * });
 */
qase.ignore = function() {
  addMetadata({
    ignore: true,
  });
  return this;
};

/**
 * Set a suite for the test case
 * @param {string} value
 * @example
 * test('test', async ({ page }) => {
 *    qase.suite("Suite");
 *    await page.goto('https://example.com');
 * });
 */
qase.suite = function(value: string) {
  addMetadata({
    suite: value,
  });
  return this;
};

/**
 * Set a comment for the test case
 * @param {string} value
 * @example
 * test('test', async ({ page }) => {
 *    qase.comment("Comment");
 *    await page.goto('https://example.com');
 * });
 */
qase.comment = function(value: string) {
  addMetadata({
    comment: value,
  });
  return this;
};

const addMetadata = (metadata: MetadataMessage): void => {
  test.info().attach('qase-metadata.json', {
    contentType: ReporterContentType,
    body: Buffer.from(JSON.stringify(metadata), 'utf8'),
  }).catch(() => {/**/
  });
};

const addAttachment = (name: string, contentType: string, filePath?: string, body?: string | Buffer) => {
  const stepName = filePath != undefined ? `step_attach_file_${uuidv4()}_${name}` : `step_attach_body_${uuidv4()}_${name}`;

  test.step(stepName, async () => {
    if (filePath) {
      await test.info().attach(stepName, {
        contentType: contentType,
        body: filePath,
      });
    }

    if (body) {
      await test.info().attach(stepName, {
        contentType: contentType,
        body: body,
      });
    }
  }).catch(() => {/**/
  });
};

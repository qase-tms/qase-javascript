import path from 'path';
import { getMimeTypes, QaseStep, StepFunction, formatTitleWithProjectMapping } from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';
import { MetadataWriter } from './metadataChannel';

/** Project code → test case IDs for multi-project (testops_multi) mode. */
export type ProjectMapping = Record<string, number[]>;

const writer = new MetadataWriter();

export const qase = (
  caseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];

  return `${name} (Qase ID: ${caseIds.join(',')})`;
};

/**
 * Build test name with multi-project markers (for testops_multi mode).
 * @param mapping — e.g. { PROJ1: [1, 2], PROJ2: [3] }
 * @param name — test title
 * @example test(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), () => { ... });
 */
qase.projects = (mapping: ProjectMapping, name: string): string => {
  return formatTitleWithProjectMapping(name, mapping);
};

/**
 * Set a title for the test case
 * @param {string} value
 * @example
 * test('test', () => {
 *    qase.title("Title");
 *     expect(true).toBe(true);
 * });
 */
qase.title = (value: string): void => {
  writer.title(value);
};

/**
 * Ignore the test case
 * @example
 * test('test', () => {
 *    qase.ignore();
 *     expect(true).toBe(true);
 * });
 */
qase.ignore = (): void => {
  writer.ignore();
};

/**
 * Mute the test case
 * @example
 * test('test', () => {
 *    qase.mute();
 *     expect(true).toBe(true);
 * });
 */
qase.mute = (): void => {
  writer.mute();
};

/**
 * Add a comment to the test case
 * @param {string} value
 * @example
 * test('test', () => {
 *    qase.comment("Comment");
 *     expect(true).toBe(true);
 * });
 */
qase.comment = (value: string): void => {
  writer.comment(value);
};

/**
 * Set a suite for the test case
 * @param {string} value
 * @example
 * test('test', () => {
 *    qase.suite("Suite");
 *     expect(true).toBe(true);
 * });
 */
qase.suite = (value: string): void => {
  writer.suite(value);
};

/**
 * Set fields for the test case
 * @param {Record<string, string>} values
 * @example
 * test('test', () => {
 *    qase.fields({field: "value"});
 *     expect(true).toBe(true);
 * });
 */
qase.fields = (values: Record<string, string>): void => {
  writer.fields(values);
};

/**
 * Set parameters for the test case
 * @param {Record<string, string>} values
 * @example
 * test('test', () => {
 *    qase.parameters({param: "value"});
 *     expect(true).toBe(true);
 * });
 */
qase.parameters = (values: Record<string, string>): void => {
  writer.parameters(values);
};

/**
 * Set group params for the test case
 * @param {Record<string, string>} values
 * @example
 * test('test', () => {
 *    qase.groupParameters({param: "value"});
 *     expect(true).toBe(true);
 * });
 */
qase.groupParameters = (values: Record<string, string>): void => {
  writer.groupParams(values);
};

/**
 * Set tags for the test case
 * @param {...string} values
 * @example
 * test('test', () => {
 *    qase.tags('smoke', 'regression');
 *     expect(true).toBe(true);
 * });
 */
qase.tags = (...values: string[]): void => {
  writer.tags(values);
};

/**
 * Add a step to the test case
 * @param name
 * @param body
 * @param expectedResult
 * @param data
 * @example
 * test('test', () => {
 *    qase.step("Step", () => {
 *      expect(true).toBe(true);
 *    });
 *     expect(true).toBe(true);
 * });
 * @example
 * test('test', () => {
 *    qase.step("Step", () => {
 *      expect(true).toBe(true);
 *    }, "Expected result", "Input data");
 *     expect(true).toBe(true);
 * });
 */
qase.step = async (name: string, body: StepFunction, expectedResult?: string, data?: string) => {
  const stepName = expectedResult || data 
    ? `${name} QaseExpRes:${expectedResult ? `: ${expectedResult}` : ''} QaseData:${data ? `: ${data}` : ''}` 
    : name;
  const runningStep = new QaseStep(stepName);
  // eslint-disable-next-line @typescript-eslint/require-await
  await runningStep.run(body, async (step) => {
    writer.step(step);
  });
};


/**
 * Add an attachment to the test case
 * @param attach
 * @example
 * test('test', () => {
 *   qase.attach({ name: 'attachment.txt', content: 'Hello, world!', type: 'text/plain' });
 *   qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
 *     expect(true).toBe(true);
 * });
 */
qase.attach = (attach: {
  name?: string;
  type?: string;
  content?: string;
  paths?: string[];
}) => {
  if (attach.paths) {
    for (const file of attach.paths) {
      const attachmentName = path.basename(file);
      const contentType: string = getMimeTypes(file);

      writer.attachment({
        file_path: file,
        size: 0,
        id: uuidv4(),
        file_name: attachmentName,
        mime_type: contentType,
        content: '',
      });
    }
    return;
  }

  if (attach.content) {
    writer.attachment({
      file_path: null,
      size: attach.content.length,
      id: uuidv4(),
      file_name: attach.name ?? 'attachment',
      mime_type: attach.type ?? 'application/octet-stream',
      content: attach.content,
    });
  }
};




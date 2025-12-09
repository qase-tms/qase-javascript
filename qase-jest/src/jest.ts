import path from 'path';
import { getMimeTypes, QaseStep, StepFunction } from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';

export const qase = (
  caseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];

  return `${name} (Qase ID: ${caseIds.join(',')})`;
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.title(value);
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.ignore();
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.comment(value);
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.suite(value);
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.fields(values);
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.parameters(values);
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
  // @ts-expect-error - global.Qase is dynamically added at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  global.Qase.groupParams(values);
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
    // @ts-expect-error - global.Qase is dynamically added at runtime
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return global.Qase.step(step);
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

      // @ts-expect-error - global.Qase is dynamically added at runtime
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      global.Qase.attachment({
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
    // @ts-expect-error - global.Qase is dynamically added at runtime
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    global.Qase.attachment({
      file_path: null,
      size: attach.content.length,
      id: uuidv4(),
      file_name: attach.name ?? 'attachment',
      mime_type: attach.type ?? 'application/octet-stream',
      content: attach.content,
    });
  }
};




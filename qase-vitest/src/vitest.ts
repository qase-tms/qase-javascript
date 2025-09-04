import path from 'path';
import { getMimeTypes, QaseStep, StepFunction } from 'qase-javascript-commons';

export const qase = (
  caseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(caseId) ? caseId : [caseId];

  return `${name} (Qase ID: ${caseIds.join(',')})`;
};

// Type for annotate function from Vitest
type AnnotateFunction = (message: string, options?: any) => Promise<void>;

// Type for qase wrapper functions
export interface QaseWrapper {
  annotate(message: string, options?: any): Promise<void>;
  title(value: string): Promise<void>;
  comment(value: string): Promise<void>;
  suite(value: string): Promise<void>;
  fields(values: Record<string, string>): Promise<void>;
  parameters(values: Record<string, string>): Promise<void>;
  groupParameters(values: Record<string, string>): Promise<void>;
  step(name: string, body: StepFunction): Promise<void>;
  attach(attach: {
    name?: string;
    type?: string;
    content?: string;
    paths?: string[];
  }): Promise<void>;
}

// Type for test context with qase
export interface TestContextWithQase {
  qase: QaseWrapper;
  annotate: AnnotateFunction;
}

/**
 * Create qase wrapper for annotate function
 * @param annotate - Vitest annotate function
 * @returns QaseWrapper object with all qase methods
 */
const createQaseWrapper = (annotate: AnnotateFunction): QaseWrapper => {
  return {
    async annotate(message: string, options?: any) {
      return await annotate(message, options);
    },

    /**
     * Set a title for the test case
     * @param {string} value
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.title("Title");
     *     expect(true).toBe(true);
     * }));
     */
    async title(value: string): Promise<void> {
      return await annotate(`Qase Title: ${value}`, { type: 'qase-title', body: value });
    },


    /**
     * Add a comment to the test case
     * @param {string} value
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.comment("Comment");
     *     expect(true).toBe(true);
     * }));
     */
    async comment(value: string): Promise<void> {
      return await annotate(`Qase Comment: ${value}`, { type: 'qase-comment', body: value });
    },

    /**
     * Set a suite for the test case
     * @param {string} value
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.suite("Suite");
     *     expect(true).toBe(true);
     * }));
     */
    async suite(value: string): Promise<void> {
      return await annotate(`Qase Suite: ${value}`, { type: 'qase-suite', body: value });
    },

    /**
     * Set fields for the test case
     * @param {Record<string, string>} values
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.fields({field: "value"});
     *     expect(true).toBe(true);
     * }));
     */
    async fields(values: Record<string, string>): Promise<void> {
      return await annotate(`Qase Fields: ${JSON.stringify(values)}`, { type: 'qase-fields', body: JSON.stringify(values) });
    },

    /**
     * Set parameters for the test case
     * @param {Record<string, string>} values
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.parameters({param: "value"});
     *     expect(true).toBe(true);
     * }));
     */
    async parameters(values: Record<string, string>): Promise<void> {
      return await annotate(`Qase Parameters: ${JSON.stringify(values)}`, { type: 'qase-parameters', body: JSON.stringify(values) });
    },

    /**
     * Set group params for the test case
     * @param {Record<string, string>} values
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.groupParameters({param: "value"});
     *     expect(true).toBe(true);
     * }));
     */
    async groupParameters(values: Record<string, string>): Promise<void> {
      return await annotate(`Qase Group Parameters: ${JSON.stringify(values)}`, { type: 'qase-group-parameters', body: JSON.stringify(values) });
    },

    /**
     * Add a step to the test case
     * @param name
     * @param body
     * @example
     * test('test', withQase(async ({ qase }) => {
     *    await qase.step("Step", () => {
     *      expect(true).toBe(true);
     *    });
     *     expect(true).toBe(true);
     * }));
     */
    async step(name: string, body: StepFunction): Promise<void> {
      await annotate(`Qase Step Start: ${name}`, { type: 'qase-step-start', body: name });
      try {
        const runningStep = new QaseStep(name);
        await runningStep.run(body, async (step) => {
          const stepName = 'action' in step.data ? step.data.action : step.data.name;
          await annotate(`Qase Step: ${stepName}`, { type: 'qase-step', body: stepName });
        });
        await annotate(`Qase Step End: ${name}`, { type: 'qase-step-end', body: name });
      } catch (error) {
        await annotate(`Qase Step Failed: ${name} - ${error}`, { type: 'qase-step-failed', body: `${name} - ${error}` });
        throw error;
      }
    },

    /**
     * Add an attachment to the test case
     * @param attach
     * @example
     * test('test', withQase(async ({ qase }) => {
     *   await qase.attach({ name: 'attachment.txt', content: 'Hello, world!', type: 'text/plain' });
     *   await qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
     *     expect(true).toBe(true);
     * }));
     */
    async attach(attach: {
      name?: string;
      type?: string;
      content?: string;
      paths?: string[];
    }): Promise<void> {
      if (attach.paths) {
        for (const file of attach.paths) {
          const attachmentName = path.basename(file);
          const contentType: string = getMimeTypes(file);

          await annotate(`Qase Attachment: ${attachmentName}`, {
            type: 'qase-attachment',
            body: attachmentName,
            attachment: {
              path: file,
              contentType: contentType
            }
          });
        }
        return;
      }

      if (attach.content) {
        await annotate(`Qase Attachment: ${attach.name ?? 'attachment'}`, {
          type: 'qase-attachment',
          body: attach.content,
          attachment: {
            contentType: attach.type ?? 'application/octet-stream',
            body: attach.content
          }
        });
      }
    }
  };
};

/**
 * Higher-order function that extends test context with qase functions
 * @param testFn - Test function that receives context with qase
 * @returns Wrapped test function
 * @example
 * test('hello world', withQase(async ({ qase, annotate }) => {
 *   await qase.title("My Test Title");
 *   await qase.comment("This is a test comment");
 *   
 *   if (condition) {
 *     await qase.annotate('this should\'ve errored', 'error');
 *   }
 * }));
 */
export const withQase = <T extends any[]>(
  testFn: (context: TestContextWithQase & T[0]) => any
) => {
  return async (context: T[0] & { annotate: AnnotateFunction }) => {
    const qase = createQaseWrapper(context.annotate);
    return await testFn({ ...context, qase } as TestContextWithQase & T[0]);
  };
};





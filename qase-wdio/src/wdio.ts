import { events } from './events';
import { QaseStep, StepFunction, formatTitleWithProjectMapping } from 'qase-javascript-commons';

/**
 * Send event to reporter
 * @param {string} event  - event name
 * @param {object} msg - event payload
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendEvent = (event: string, msg: any = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  process.emit(event as any, msg);
};

/**
 * Set IDs for the test case
 *
 * @param qaseId
 * @param name
 * @example
 * describe('suite', () => {
 *  it(qase(1, 'should work'), () => {
 *    // test code
 *  });
 * });
 * @returns {string}
 */
export const qase = (
  qaseId: number | string | number[] | string[],
  name: string,
): string => {
  const caseIds = Array.isArray(qaseId) ? qaseId : [qaseId];
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

  const newName = `${name} (Qase ID: ${caseIds.join(',')})`;

  return newName;
};

/** Project code → test case IDs for multi-project (testops_multi) mode. */
export type ProjectMapping = Record<string, number[]>;

/**
 * Build test name with multi-project markers (for testops_multi mode).
 * @param mapping — e.g. { PROJ1: [1, 2], PROJ2: [3] }
 * @param name — test title
 * @example it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), () => { ... });
 */
qase.projects = (mapping: ProjectMapping, name: string): string => {
  return formatTitleWithProjectMapping(name, mapping);
};

/**
 * Set IDs for the test case.
 * Deprecated: Use qase(qaseId, name) instead.
 *
 * @param value
 * @returns {string}
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.id(1);
 *    // test code
 *  });
 * });
 */
qase.id = (value: number | number[]) => {
  sendEvent(events.addQaseID, { ids: Array.isArray(value) ? value : [value] });
  return this;
};

/**
 * Set a title for the test case
 * @param {string} value
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.title("Title");
 *    // test code
 *  });
 * });
 */
qase.title = (value: string) => {
  sendEvent(events.addTitle, { title: value });
  return this;
};

/**
 * Set parameters for the test case
 * @param {Record<string, string>} values
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.parameters({ param1: 'value1', param2: 'value2' });
 *    // test code
 *  });
 * });
 */
qase.parameters = (values: Record<string, string>) => {
  sendEvent(events.addParameters, { records: values });
  return this;
};

/**
 * Set group parameters for the test case
 * @param {Record<string, string>} values
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.groupParameters({ param1: 'value1', param2: 'value2' });
 *    // test code
 *  });
 * });
 */
qase.groupParameters = (values: Record<string, string>) => {
  sendEvent(events.addGroupParameters, { records: values });
  return this;
};

/**
 * Set fields for the test case
 * @param {Record<string, string>} values
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.fields({ field1: 'value1', field2: 'value2' });
 *    // test code
 *  });
 * });
 */
qase.fields = (values: Record<string, string>) => {
  sendEvent(events.addFields, { records: values });
  return this;
};

/**
 * Set suite for the test case
 * @param {string} value
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.suite('Suite');
 *    // test code
 *  });
 * });
 */
qase.suite = (value: string) => {
  sendEvent(events.addSuite, { suite: value });
  return this;
};

/**
 * Set ignore for the test case
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.ignore();
 *    // test code
 *  });
 * });
 */
qase.ignore = () => {
  sendEvent(events.addIgnore, {});
  return this;
};

/**
 * Set attachment for the test case
 * @param {object} attach
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.attach({ name: 'attachment', type: 'text/plain', content: 'attachment content' });   
 *    // test code
 *  });
 * });
 */
qase.attach = (attach: {
  name?: string;
  type?: string;
  content?: string;
  paths?: string[];
}) => {
  sendEvent(events.addAttachment, attach);
  return this;
};

/**
 * Set step for the test case
 * @param {string} name
 * @param {StepFunction} body
 * @example
 * describe('suite', () => {
 *  it('should work', () => {
 *    qase.step('step', async () => {
 *      // step code
 *    });
 *    // test code
 *  });
 * });
 */
qase.step = async (name: string, body: StepFunction) => {
  const runningStep = new QaseStep(name);
  // eslint-disable-next-line @typescript-eslint/require-await
  await runningStep.run(body, async (message) => sendEvent(events.addStep, message));
  return this;
};

import { events } from './events';
import { QaseStep, StepFunction } from './step';

/**
 * Send event to reporter
 * @param {string} event  - event name
 * @param {object} msg - event payload
 * @private
 */
const sendEvent = (event: string, msg: any = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  process.emit(event as any, msg);
};

export class qase {
  /**
   * Assign QaseID to test
   * @name id
   * @param {number | number[]} value
   */
  public static id(value: number | number[]) {
    sendEvent(events.addQaseID, { ids: Array.isArray(value) ? value : [value] });
    return this;
  }

  /**
   * Assign title to test
   * @name title
   * @param {string} value
   */
  public static title(value: string) {
    sendEvent(events.addTitle, { title: value });
    return this;
  }

  /**
   * Assign parameters to test
   * @name parameters
   * @param {Record<string, string>} values
   */
  public static parameters(values: Record<string, string>) {
    sendEvent(events.addParameters, { records: values });

    return this;
  }

  /**
   * Assign fields to test
   * @name fields
   * @param {Record<string, string>} values
   */
  public static fields(values: Record<string, string>) {
    sendEvent(events.addFields, { records: values });

    return this;
  }

  /**
   * Assign suite to test
   * @name suite
   * @param {string} value
   */
  public static suite(value: string) {
    sendEvent(events.addSuite, { suite: value });

    return this;
  }

  /**
   * Assign ignore mark to test
   * @name ignore
   */
  public static ignore() {
    sendEvent(events.addIgnore, {});

    return this;
  }


  /**
   * Assign attachment to test
   * @name attach
   * @param attach
   */
  public static attach(attach: {
    name?: string;
    type?: string;
    content?: string;
    paths?: string[];
  }) {
    sendEvent(events.addAttachment, attach);

    return this;
  }


  /**
   * Starts step
   * @param {string} name - the step name
   * @param {StepFunction} body - the step content function
   */
  public static async step(name: string, body: StepFunction) {
    const runningStep = new QaseStep(name);
    // eslint-disable-next-line @typescript-eslint/require-await
    await runningStep.run(body, async (message) => sendEvent(events.addStep, message));
  }
}

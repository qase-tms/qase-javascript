import { EventEmitter } from 'events';
import {
  Formatter,
  IFormatterOptions,
} from '@cucumber/cucumber';
import { Envelope } from '@cucumber/messages';
import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
} from 'qase-javascript-commons';
import { Storage } from './storage';

export type CucumberQaseOptionsType = IFormatterOptions & {
  qase?: ConfigType;
};

/**
 * @class CucumberQaseReporter
 * @extends Formatter
 */
export class CucumberQaseReporter extends Formatter {

  /**
   * @type {Record<string, string>}
   * @private
   */
  private storage: Storage;

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;
  /**
   * @type {EventEmitter}
   * @private
   */
  private eventBroadcaster: EventEmitter;

  /**
   * @param {CucumberQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: CucumberQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const { qase, ...formatterOptions } = options;
    const config = configLoader.load();

    super(formatterOptions);

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(qase, config),
      frameworkPackage: '@cucumber/cucumber',
      frameworkName: 'cucumberjs',
      reporterName: 'cucumberjs-qase-reporter',
    });

    this.eventBroadcaster = formatterOptions.eventBroadcaster;
    this.storage = new Storage();
    this.bindEventListeners();
  }

  /**
   * @private
   */
  private bindEventListeners() {
    this.eventBroadcaster.on('envelope', (envelope: Envelope) => {
      if (envelope.gherkinDocument) {
        this.storage.addScenario(envelope.gherkinDocument);
      } else if (envelope.pickle) {
        this.storage.addPickle(envelope.pickle);
      } else if (envelope.attachment) {
        this.storage.addAttachment(envelope.attachment);
      } else if (envelope.testRunStarted) {
        this.startTestRun();
      } else if (envelope.testRunFinished) {
        void this.publishResults();
      } else if (envelope.testCase) {
        this.storage.addTestCase(envelope.testCase);
      } else if (envelope.testCaseStarted) {
        this.storage.addTestCaseStarted(envelope.testCaseStarted);
      } else if (envelope.testStepFinished) {
        this.storage.addTestCaseStep(envelope.testStepFinished);
      } else if (envelope.testCaseFinished) {
        const result =
          this.storage.convertTestCase(envelope.testCaseFinished);

        if (!result) {
          return;
        }

        void this.reporter.addTestResult(result);
      }
    });
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private async publishResults(): Promise<void> {
    await this.reporter.publish();
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private startTestRun(): void {
    this.reporter.startTestRun();
  }
}

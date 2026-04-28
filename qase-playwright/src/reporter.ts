import { Reporter, TestCase, TestResult, TestStatus, TestStep } from '@playwright/test/reporter';

import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { ReporterOptionsType } from './options';
import { StepIndex } from './step-index';
import { AnnotationExtractor } from './annotation-extractor';
import { StepConverter } from './step-converter';
import { MetadataExtractor } from './metadata-extractor';
import { ResultBuilder } from './result-builder';

export type PlaywrightQaseOptionsType = Omit<ConfigType, 'reporterOptions'> & {
  framework: ReporterOptionsType;
};

/**
 * @class PlaywrightQaseReporter
 * @implements Reporter
 */
export class PlaywrightQaseReporter implements Reporter {
  /**
   * @type {Record<TestStatus, TestStatusEnum>}
   */
  static statusMap: Record<TestStatus, TestStatusEnum> = {
    passed: TestStatusEnum.passed,
    failed: TestStatusEnum.failed,
    skipped: TestStatusEnum.skipped,
    timedOut: TestStatusEnum.failed,
    interrupted: TestStatusEnum.failed,
  };

  /**
   * @type {Map<string, number[]>}
   * @private
   */
  private static qaseIds: Map<string, number[]> = new Map<string, number[]>();

  private stepIndex: StepIndex = new StepIndex();

  private annotationExtractor: AnnotationExtractor = new AnnotationExtractor();

  private stepConverter: StepConverter = new StepConverter(this.stepIndex);

  private metadataExtractor: MetadataExtractor = new MetadataExtractor(this.stepIndex);

  private resultBuilder: ResultBuilder = new ResultBuilder(this.stepConverter);

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  private options: ReporterOptionsType;

  /**
   * @param {PlaywrightQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: PlaywrightQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();
    const { framework, ...composedOptions } = composeOptions(options, config);

    this.options = options.framework ?? {};

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: '@playwright/test',
      frameworkName: 'playwright',
      reporterName: 'playwright-qase-reporter',
    });
  }

  /**
   * @param {TestCase} test
   * @param _result
   * @param step
   */
  onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category !== 'test.step') {
      return;
    }
    if (this.stepIndex.hasStepCached(step)) {
      return;
    }
    this.stepIndex.cacheStep(step, test);
  }

  public onBegin(): void {
    this.reporter.startTestRun();
  }

  /**
   * @param {TestCase} test
   * @param {TestResult} result
   */
  public async onTestEnd(test: TestCase, result: TestResult) {
    const metadata = this.metadataExtractor.transform(result.attachments);
    const annotations = {
      ids: this.annotationExtractor.extractQaseIds(test.annotations),
      projectMapping: this.annotationExtractor.extractProjectMapping(test.annotations),
      suites: this.annotationExtractor.extractSuite(test.annotations),
    };

    const testResult = this.resultBuilder.build({
      test,
      result,
      metadata,
      annotations,
      options: this.options,
      isCaptureLogs: this.reporter.isCaptureLogs(),
      qaseIdsRegistry: PlaywrightQaseReporter.qaseIds,
    });

    if (testResult) {
      await this.reporter.addTestResult(testResult);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd(): Promise<void> {
    await this.reporter.publish();
  }

  // add this method for supporting old version of qase
  public static addIds(ids: number[], title: string): void {
    this.qaseIds.set(title, ids);
  }

  /**
   * @param {TestStep[]} steps
   * @returns {boolean}
   */
  checkChildrenSteps(steps: TestStep[]): boolean {
    return this.stepConverter.hasOnlyLeafCategories(steps);
  }

}

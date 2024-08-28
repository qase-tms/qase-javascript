import { MochaOptions, reporters, Runner, Suite } from 'mocha';
import { Context, Hook, Metadata, Test } from './types';
import {
  Attachment,
  composeOptions,
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import deasyncPromise from 'deasync-promise';
import { extname, join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const Events = Runner.constants;

type MochaState = 'failed' | 'passed' | 'pending';

class currentTest {
  steps: TestStepType[] = [];
  status: MochaState = 'passed';
  attachments: Attachment[] = [];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions
const resolveParallelModeSetupFile = () => join(__dirname, `parallel${extname(__filename)}`);

export class MochaQaseReporter extends reporters.Base {

  /**
   * @type {Record<CypressState, TestStatusEnum>}
   */
  static statusMap: Record<MochaState, TestStatusEnum> = {
    failed: TestStatusEnum.failed,
    passed: TestStatusEnum.passed,
    pending: TestStatusEnum.skipped,
  };

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @type {Metadata}
   * @private
   */
  private readonly metadata: Metadata = new Metadata();

  private currentTest: currentTest = new currentTest();
  private currentType: 'test' | 'step' = 'test';

  public constructor(
    runner: Runner,
    options: MochaOptions,
    configLoader = new ConfigLoader(),
  ) {
    super(runner, options);
    const config = configLoader.load();

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(options, config),
      frameworkPackage: 'mocha',
      frameworkName: 'mocha',
      reporterName: 'mocha-qase-reporter',
    });

    if (options.parallel) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options.require = [...(options.require ?? []), resolveParallelModeSetupFile()];
    } else {
      this.applyListeners();
    }
  }

  private applyListeners = () => {
    this.runner.on(Events.EVENT_RUN_BEGIN, () => this.onStartRun());
    this.runner.on(Events.EVENT_RUN_END, () => this.onEndRun());

    this.runner.on(Events.EVENT_TEST_BEGIN, (test: Test) => this.addMethods(test.ctx));
    this.runner.on(Events.EVENT_HOOK_BEGIN, (hook: Hook) => this.addMethods(hook.ctx));

    this.runner.on(Events.EVENT_TEST_BEGIN, () => this.onStartTest());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.runner.on(Events.EVENT_TEST_END, async (test) => await this.onEndTest(test));
  };

  private onStartRun() {
    this.reporter.startTestRun();
  }

  private onEndRun() {
    deasyncPromise(this.reporter.publish());
  }

  private addMethods(ctx?: Context) {
    if (!ctx) return;

    ctx.qaseId = this.qaseId;
    ctx.title = this.title;
    ctx.parameters = this.parameters;
    ctx.groupParameters = this.groupParameters;
    ctx.fields = this.fields;
    ctx.suite = this.suite;
    ctx.ignore = this.ignore;
    ctx.attach = this.attach;
    ctx.comment = this.comment;
    ctx.step = this.step;
  }

  private onStartTest() {
    this.currentType = 'test';
  }

  private async onEndTest(test: Mocha.Test) {
    if (this.metadata.ignore) {
      return;
    }

    const ids = this.getQaseId();
    const suites = this.getSuites(test);
    let relations = {};
    if (suites.length > 0) {
      const data = [];
      for (const suite of suites) {
        data.push({
          title: suite,
          public_id: null,
        });
      }

      relations = {
        suite: {
          data: data,
        },
      };
    }

    let message = this.metadata.comment;
    if (test.err?.message) {
      message += '\n\n' + test.err.message;
    }

    const result: TestResultType = {
      attachments: this.metadata.attachments ?? [],
      author: null,
      fields: this.metadata.fields ?? {},
      message: message ?? null,
      muted: false,
      params: this.metadata.parameters ?? {},
      group_params: this.metadata.groupParameters ?? {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, ids),
      steps: this.currentTest.steps,
      id: uuidv4(),
      execution: {
        status: test.state
          ? MochaQaseReporter.statusMap[test.state]
          : TestStatusEnum.invalid,
        start_time: null,
        end_time: null,
        duration: test.duration ?? 0,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: ids.length > 0 ? ids : null,
      title: this.metadata.title && this.metadata.title != '' ? this.metadata.title : test.title,
    };

    await this.reporter.addTestResult(result);

    this.metadata.clear();
    this.currentTest = new currentTest();
  }

  /**
   * @param {Test} test
   * @param {number[]} ids
   * @private
   */
  private getSignature(test: Mocha.Test, ids: number[]) {
    let signature = '';
    const file = test.parent ? this.getFile(test.parent) : undefined;

    if (file) {
      const executionPath = process.cwd() + '/';
      const path = file.replace(executionPath, '') ?? '';
      signature = path.split('/').join('::');
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        signature += '::' + suite.toLowerCase().replace(/\s/g, '_');
      }
    }

    signature += '::' + test.title.toLowerCase().replace(/\s/g, '_');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    return signature;
  }

  /**
   * @param {Suite} suite
   * @private
   */
  private getFile(suite: Suite): string | undefined {
    if (suite.file) {
      return suite.file;
    }

    if (suite.parent) {
      return this.getFile(suite.parent);
    }

    return undefined;
  }

  /**
   * @returns {number[]}
   * @private
   */
  private getQaseId(): number[] {
    if (this.metadata.ids) {
      return this.metadata.ids;
    }

    return [];
  }

  /**
   * @param {Mocha.Test} test
   * @returns {string[]}
   * @private
   */
  private getSuites(test: Mocha.Test): string[] {
    if (this.metadata.suite) {
      return [this.metadata.suite];
    }

    const suites = [];
    if (test.parent) {
      suites.push(...test.parent.titlePath().filter(Boolean));
    }

    return suites;
  }

  qaseId = (id: number | number[]) => {
    this.metadata.addQaseId(id);
  };

  title = (title: string) => {
    this.metadata.title = title;
  };

  parameters = (values: Record<string, string>) => {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.metadata.parameters = stringRecord;
  };

  groupParameters = (values: Record<string, string>) => {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.metadata.groupParameters = stringRecord;
  };

  fields = (values: Record<string, string>) => {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.metadata.fields = stringRecord;
  };

  suite = (name: string) => {
    this.metadata.suite = name;
  };

  ignore = () => {
    this.metadata.ignore = true;
  };

  attach = (attach: { name?: string, paths?: string | string[], content?: Buffer | string, contentType?: string }) => {
    this.metadata.addAttachment(attach);
  };

  comment = (message: string) => {
    this.metadata.addComment(message);
  };

  step = (title: string, func: () => void) => {

    const previousType = this.currentType;

    this.currentType = 'step';

    const step: TestStepType = {
      step_type: StepType.TEXT,
      data: {
        action: title,
        expected_result: null,
      },
      execution: {
        start_time: Date.now(),
        status: StepStatusEnum.passed,
        end_time: null,
        duration: null,
      },
      id: '',
      parent_id: null,
      attachments: [],
      steps: [],
    };

    try {
      func();
    } catch (err) {
      step.execution.status = StepStatusEnum.failed;
      this.currentTest.status = 'failed';
    }

    step.execution.end_time = Date.now();

    this.currentTest.steps.push(step);
    this.currentType = previousType;
  };
}


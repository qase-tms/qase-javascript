import { Context, MochaOptions, reporters, Runner, Suite } from 'mocha';
import { Hook, Metadata, Test } from './types';
import {
  Attachment,
  composeOptions,
  ConfigLoader,
  generateSignature,
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
import { StreamInterceptor, TestOutput } from './interceptor';


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

  private originalStdoutWrite: typeof process.stdout.write;
  private originalStderrWrite: typeof process.stderr.write;
  private testOutputs: Map<string, TestOutput>;

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
  private testBeginTime: number = Date.now();
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

    this.originalStdoutWrite = process.stdout.write.bind(process.stdout);
    this.originalStderrWrite = process.stderr.write.bind(process.stderr);
    this.testOutputs = new Map();
  }

  private applyListeners = () => {
    this.runner.on(Events.EVENT_RUN_BEGIN, () => this.onStartRun());
    this.runner.on(Events.EVENT_RUN_END, () => this.onEndRun());

    this.runner.on(Events.EVENT_TEST_BEGIN, (test: Test) => this.addMethods(test));
    this.runner.on(Events.EVENT_HOOK_BEGIN, (hook: Hook) => this.addMethodsToContext(hook.ctx));

    this.runner.on(Events.EVENT_TEST_BEGIN, () => this.onStartTest());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.runner.on(Events.EVENT_TEST_END, (test) => this.onEndTest(test));
  };

  private onStartRun() {
    deasyncPromise(this.reporter.startTestRunAsync());
  }

  private onEndRun() {
    deasyncPromise(this.reporter.publish());
  }

  private addMethodsToContext(ctx?: Context) {
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

  private addMethods(test: Test) {
    const stdoutInterceptor = new StreamInterceptor((data: string) => {
      const output = this.testOutputs.get(test.title) ?? { stdout: '', stderr: '' };
      output.stdout += data;
      this.testOutputs.set(test.title, output);
    });

    const stderrInterceptor = new StreamInterceptor((data: string) => {
      const output = this.testOutputs.get(test.title) ?? { stdout: '', stderr: '' };
      output.stderr += data;
      this.testOutputs.set(test.title, output);

    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    process.stdout.write = stdoutInterceptor.write.bind(stdoutInterceptor);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    process.stderr.write = stderrInterceptor.write.bind(stderrInterceptor);

    this.testOutputs.set(test.title, { stdout: '', stderr: '' });

    this.addMethodsToContext(test.ctx);
  }

  private onStartTest() {
    this.currentType = 'test';
    this.testBeginTime = Date.now();
  }

  private onEndTest(test: Mocha.Test) {
    const end_time = Date.now();
    const duration = test.duration ?? end_time - this.testBeginTime;

    process.stdout.write = this.originalStdoutWrite;
    process.stderr.write = this.originalStderrWrite;

    if (this.reporter.isCaptureLogs()) {
      const output = this.testOutputs.get(test.title);

      if (output?.stdout) {
        this.attach({ name: 'stdout.txt', content: output.stdout, contentType: 'text/plain' });
      }

      if (output?.stderr) {
        this.attach({ name: 'stderr.txt', content: output.stderr, contentType: 'text/plain' });
      }
    }

    if (this.metadata.ignore) {
      this.metadata.clear();
      this.currentTest = new currentTest();
      return;
    }

    const ids = this.getQaseId();
    if (ids.length === 0) {
      ids.push(...MochaQaseReporter.getCaseId(test.title));
    }
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
      signature: this.getSignature(test, ids, this.metadata.parameters ?? {}),
      steps: this.currentTest.steps,
      id: uuidv4(),
      execution: {
        status: test.state
          ? MochaQaseReporter.statusMap[test.state]
          : TestStatusEnum.invalid,
        start_time: this.testBeginTime / 1000,
        end_time: end_time / 1000,
        duration: duration,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: ids.length > 0 ? ids : null,
      title: this.metadata.title && this.metadata.title != '' ? this.metadata.title : this.removeQaseIdsFromTitle(test.title),
    };

    void this.reporter.addTestResult(result);

    this.metadata.clear();
    this.currentTest = new currentTest();
  }

  /**
   * @param {Test} test
   * @param {number[]} ids
   * @private
   */
  private getSignature(test: Mocha.Test, ids: number[], params: Record<string, string>) {
    const suites = [];
    const file = test.parent ? this.getFile(test.parent) : undefined;

    if (file) {
      const executionPath = process.cwd() + '/';
      const path = file.replace(executionPath, '');
      suites.push(path.split('/').join('::'));
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        suites.push(suite.toLowerCase().replace(/\s/g, '_'));
      }
    }

    suites.push(test.title.toLowerCase().replace(/\s/g, '_'));

    return generateSignature(ids, suites, params);
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
        data: null,
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

  /**
   * @param {string} title
   * @returns {string}
   * @private
   */
  private removeQaseIdsFromTitle(title: string): string {
    const matches = title.match(MochaQaseReporter.qaseIdRegExp);
    if (matches) {
      return title.replace(matches[0], '').trimEnd();
    }
    return title;
  }

  /**
   * @type {RegExp}
   */
  static qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

  /**
   * @param {string} title
   * @returns {number[]}
   * @private
   */
  private static getCaseId(title: string): number[] {
    const [, ids] = title.match(MochaQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }
}


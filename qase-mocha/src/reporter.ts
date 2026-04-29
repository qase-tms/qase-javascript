import { Context, MochaOptions, reporters, Runner, Suite } from 'mocha';
import { Hook, Metadata, Test } from './types';
import {
  composeOptions,
  ConfigLoader,
  generateSignature,
  QaseReporter,
  ReporterInterface,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import {
  removeQaseIdsFromTitle,
  getFile as getFileFromNode,
  FileSuiteNode,
  normalizeSuitePart,
} from 'qase-javascript-commons/internal';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import deasyncPromise from 'deasync-promise';
import { extname, join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { OutputCapture } from './modules/outputCapture';
import { StepRunner } from './modules/stepRunner';
import {
  parseExtraReporters,
  createExtraReporters,
  validateExtraReportersForParallel
} from './extraReporters';
import { STATUS_MAP, MochaState } from './modules/statusMap';


const Events = Runner.constants;

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions
const resolveParallelModeSetupFile = () => join(__dirname, `parallel${extname(__filename)}`);

/**
 * Adapter around the shared `getFile` helper to bridge the Mocha `Suite`
 * type (whose `parent` is `Suite | undefined`) with `FileSuiteNode`
 * (whose `parent` is optional under `exactOptionalPropertyTypes`).
 */
const getFile = (suite: Suite): string | undefined =>
  getFileFromNode(suite as unknown as FileSuiteNode);

export class MochaQaseReporter extends reporters.Base {

  private readonly outputCapture: OutputCapture = new OutputCapture();
  // readonly #extraReporters: reporters.Base[] = [];
  private profiler: NetworkProfiler | null = null;
  private _profilerStepSnapshot = 0;

  static statusMap: Record<MochaState, TestStatusEnum> = STATUS_MAP;

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

  private readonly stepRunner: StepRunner = new StepRunner();
  private testBeginTime: number = Date.now();
  private currentType: 'test' | 'step' = 'test';

  public constructor(
    runner: Runner,
    options: MochaOptions,
    configLoader = new ConfigLoader(),
  ) {
    super(runner, options);
    const config = configLoader.load();

    // Parse and validate extraReporters configuration
    const extraReportersConfig = parseExtraReporters(options, config || undefined);

    const composedOptions = composeOptions(options, config);
    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'mocha',
      frameworkName: 'mocha',
      reporterName: 'mocha-qase-reporter',
    });

    if (composedOptions.profilers?.includes('network')) {
      this.profiler = new NetworkProfiler({
        skipDomains: composedOptions.networkProfiler?.skip_domains,
        trackOnFail: composedOptions.networkProfiler?.track_on_fail,
      });
      this.profiler.enable();
    }

    // Create extra reporters in both modes, but validate compatibility for parallel mode
    if (extraReportersConfig) {
      if (options.parallel) {
        const validation = validateExtraReportersForParallel(extraReportersConfig);
        if (validation.valid) {
          createExtraReporters(runner, options, extraReportersConfig);
        } else {
          console.warn(
            `Warning: The following reporters are incompatible with parallel mode: ${validation.incompatibleReporters.join(', ')}. ` +
            'They will be ignored in parallel mode to prevent hanging issues.'
          );
        }
      } else {
        createExtraReporters(runner, options, extraReportersConfig);
      }
    }

    if (options.parallel) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options.require = [...(options.require ?? []), resolveParallelModeSetupFile()];      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (this.runner && typeof (this.runner as any).workerReporter === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (this.runner as any).workerReporter(resolveParallelModeSetupFile());
      }
    } else {
      this.applyListeners();
    }

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
    this.profiler?.restore();
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
    ctx.tags = this.tags;
    ctx.step = this.step;
  }

  private addMethods(test: Test) {
    this.outputCapture.install();
    this.addMethodsToContext(test.ctx);
  }

  private onStartTest() {
    this.outputCapture.reset();
    this.outputCapture.install();
    this.stepRunner.reset();
    this.currentType = 'test';
    this.testBeginTime = Date.now();
    this._profilerStepSnapshot = this.profiler?.getAllSteps().length ?? 0;
  }

  private onEndTest(test: Mocha.Test) {
    const end_time = Date.now();
    const duration = test.duration ?? end_time - this.testBeginTime;

    const output = this.outputCapture.drain();

    if (this.reporter.isCaptureLogs()) {
      if (output.stdout) {
        this.attach({ name: 'stdout.txt', content: output.stdout, contentType: 'text/plain' });
      }
      if (output.stderr) {
        this.attach({ name: 'stderr.txt', content: output.stderr, contentType: 'text/plain' });
      }
    }

    if (this.metadata.ignore) {
      this.metadata.clear();
      this.stepRunner.reset();
      return;
    }

    const fromTitle = parseProjectMappingFromTitle(test.title);
    const ids = this.getQaseId();
    if (ids.length === 0) {
      ids.push(...fromTitle.legacyIds);
    }
    const hasProjectMapping = Object.keys(fromTitle.projectMapping).length > 0;
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
      message += message ? `\n\n${test.err.message}` : test.err.message;
    }

    let profilerSteps: TestStepType[] = [];
    if (this.profiler) {
      const allSteps = this.profiler.getAllSteps();
      profilerSteps = allSteps.slice(this._profilerStepSnapshot);
      this._profilerStepSnapshot = 0;
    }

    const result: TestResultType = {
      attachments: this.metadata.attachments ?? [],
      author: null,
      fields: this.metadata.fields ?? {},
      tags: this.metadata.tags ?? [],
      message: message ?? null,
      muted: false,
      params: this.metadata.parameters ?? {},
      group_params: this.metadata.groupParameters ?? {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, hasProjectMapping ? [] : ids, this.metadata.parameters ?? {}),
      steps: [...this.stepRunner.getSteps(), ...profilerSteps],
      id: uuidv4(),
      execution: {
        status: determineTestStatus(test.err ?? null, test.state ?? 'failed'),
        start_time: this.testBeginTime / 1000,
        end_time: end_time / 1000,
        duration: duration,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: hasProjectMapping ? null : (ids.length > 0 ? ids : null),
      testops_project_mapping: hasProjectMapping ? fromTitle.projectMapping : null,
      title: this.metadata.title && this.metadata.title != '' ? this.metadata.title : (fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title)),
    } as TestResultType;

    void this.reporter.addTestResult(result);

    this.metadata.clear();
    this.stepRunner.reset();
  }

  /**
   * @param {Test} test
   * @param {number[]} ids
   * @private
   */
  private getSignature(test: Mocha.Test, ids: number[], params: Record<string, string>) {
    const suites = [];
    const file = test.parent ? getFile(test.parent) : undefined;

    if (file) {
      const executionPath = process.cwd() + '/';
      const path = file.replace(executionPath, '');
      suites.push(path.split('/').join('::'));
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        suites.push(normalizeSuitePart(suite));
      }
    }

    suites.push(normalizeSuitePart(test.title));

    return generateSignature(ids, suites, params);
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

  tags = (...values: string[]) => {
    this.metadata.addTags(values);
  };

  step = (title: string, func: () => void, expectedResult?: string, data?: string) => {
    const previousType = this.currentType;
    this.currentType = 'step';
    this.stepRunner.run(title, func, expectedResult, data);
    this.currentType = previousType;
  };
}

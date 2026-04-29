import { Context, MochaOptions, reporters, Runner } from 'mocha';
import { Hook, Metadata, Test } from './types';
import {
  composeOptions,
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import deasyncPromise from 'deasync-promise';
import { extname, join } from 'node:path';
import { OutputCapture } from './modules/outputCapture';
import { StepRunner } from './modules/stepRunner';
import { ProfilerTracker } from './modules/profilerTracker';
import { ResultBuilder } from './modules/resultBuilder';
import {
  parseExtraReporters,
  createExtraReporters,
  validateExtraReportersForParallel
} from './extraReporters';
import { STATUS_MAP, MochaState } from './modules/statusMap';


const Events = Runner.constants;

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions
const resolveParallelModeSetupFile = () => join(__dirname, `parallel${extname(__filename)}`);

export class MochaQaseReporter extends reporters.Base {

  private readonly outputCapture: OutputCapture = new OutputCapture();
  // readonly #extraReporters: reporters.Base[] = [];
  private profilerTracker: ProfilerTracker;

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

    let profiler: NetworkProfiler | null = null;
    if (composedOptions.profilers?.includes('network')) {
      profiler = new NetworkProfiler({
        skipDomains: composedOptions.networkProfiler?.skip_domains,
        trackOnFail: composedOptions.networkProfiler?.track_on_fail,
      });
      profiler.enable();
    }
    this.profilerTracker = new ProfilerTracker(profiler);

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
    this.profilerTracker.restore();
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
    this.profilerTracker.onTestStart();
  }

  private onEndTest(test: Mocha.Test) {
    const output = this.outputCapture.drain();
    const metadata = this.metadata;

    if (metadata.ignore) {
      this.metadata.clear();
      this.stepRunner.reset();
      this.profilerTracker.reset();
      return;
    }

    const result = ResultBuilder.build({
      test,
      metadata,
      steps: this.stepRunner.getSteps(),
      profilerSteps: this.profilerTracker.getEvents(),
      output,
      testBeginTime: this.testBeginTime,
      cwd: process.cwd(),
      attachLogs: this.reporter.isCaptureLogs(),
    });

    void this.reporter.addTestResult(result);

    this.metadata.clear();
    this.stepRunner.reset();
    this.profilerTracker.reset();
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

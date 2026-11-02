import { Context, MochaOptions, reporters, Runner } from 'mocha';
import { Hook, Test } from './types';
import { MetadataApplier } from './modules/metadataApplier';
import {
  composeOptions,
  ConfigLoader,
  QaseReporter,
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

/** Set by the parallel-mode worker reporter on the options it passes to MochaQaseReporter. */
export const PARALLEL_WORKER_OPTION = 'qaseParallelWorker';
type WorkerOptions = MochaOptions & { [PARALLEL_WORKER_OPTION]?: boolean };
type ParallelRunner = Runner & { workerReporter?: unknown };
interface GlobalFixtures {
  globalSetup?: (() => Promise<void>)[];
  globalTeardown?: (() => Promise<void>)[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/restrict-template-expressions
const resolveParallelModeSetupFile = () => join(__dirname, `parallel${extname(__filename)}`);

export class MochaQaseReporter extends reporters.Base {

  private readonly outputCapture: OutputCapture = new OutputCapture();
  private profilerTracker: ProfilerTracker;

  static statusMap: Record<MochaState, TestStatusEnum> = STATUS_MAP;

  private reporter: QaseReporter;

  private readonly metadataApplier: MetadataApplier = new MetadataApplier();

  private readonly stepRunner: StepRunner = new StepRunner();
  private testBeginTime: number = Date.now();
  private currentType: 'test' | 'step' = 'test';
  // The test between EVENT_TEST_BEGIN and its result; a failing `before each` hook never ends it.
  private currentTest: Mocha.Test | null = null;
  private readonly reportedTests = new WeakSet<Mocha.Test>();

  public constructor(
    runner: Runner,
    options: MochaOptions,
    configLoader = new ConfigLoader(),
  ) {
    super(runner, options);
    const config = configLoader.load();

    // Parse and validate extraReporters configuration
    const extraReportersConfig = parseExtraReporters(options, config ?? undefined);

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

    const isWorker = (options as WorkerOptions)[PARALLEL_WORKER_OPTION] === true;

    // In parallel mode the main process re-emits the workers' events, so extra reporters run
    // there once; in the workers they would print every file separately.
    if (extraReportersConfig && !isWorker) {
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
      // workerReporter exists only on Mocha's internal ParallelBufferedRunner, not in its typings.
      const parallelRunner = this.runner as ParallelRunner | undefined;
      if (typeof parallelRunner?.workerReporter === 'function') {
        parallelRunner.workerReporter(resolveParallelModeSetupFile());
      }
      // Workers are forked after the global setup fixtures and inherit the run started there,
      // so they only add their results. Run events here fire inside a promise job, where
      // deasync cannot wait, hence fixtures, which Mocha awaits.
      const fixtures = options as MochaOptions & GlobalFixtures;
      fixtures.globalSetup = [...(fixtures.globalSetup ?? []), () => this.reporter.startTestRunAsync()];
      fixtures.globalTeardown = [...(fixtures.globalTeardown ?? []), () => this.reporter.complete()];
    } else {
      this.applyListeners(isWorker);
    }

  }

  private applyListeners = (isWorker: boolean) => {
    if (!isWorker) {
      this.runner.on(Events.EVENT_RUN_BEGIN, () => this.onStartRun());
    }
    this.runner.on(Events.EVENT_RUN_END, () => this.onEndRun(isWorker));

    this.runner.on(Events.EVENT_TEST_BEGIN, (test: Test) => this.onStartTest(test));
    this.runner.on(Events.EVENT_HOOK_BEGIN, (hook: Hook) => this.addMethodsToContext(hook.ctx));
    // EVENT_TEST_FAIL is emitted for failing hooks too.
    this.runner.on(Events.EVENT_TEST_FAIL, (runnable: Mocha.Runnable, err: Error) => this.onFail(runnable, err));
    // `it.skip` and tests in a skipped suite get no EVENT_TEST_BEGIN, only these two events.
    this.runner.on(Events.EVENT_TEST_PENDING, (test: Mocha.Test) => this.onPending(test));
    this.runner.on(Events.EVENT_TEST_END, (test) => this.onEndTest(test));
    // Reporters such as `spec` print the result on pass/fail, before EVENT_TEST_END; stop
    // recording first so that line does not end up in the test's stdout.txt.
    this.runner.prependListener(Events.EVENT_TEST_PASS, () => this.outputCapture.stop());
    this.runner.prependListener(Events.EVENT_TEST_FAIL, () => this.outputCapture.stop());
  };

  private onStartRun() {
    deasyncPromise(this.reporter.startTestRunAsync());
  }

  private onEndRun(isWorker: boolean) {
    this.profilerTracker.restore();
    if (!isWorker) {
      deasyncPromise(this.reporter.publish());
      return;
    }
    deasyncPromise(this.reporter.sendResults());
    // A worker runs several files with one reporter instance; without this the next file
    // writes these results to the report again.
    this.reporter.setTestResults([]);
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
    ctx.mute = this.mute;
    ctx.attach = this.attach;
    ctx.comment = this.comment;
    ctx.tags = this.tags;
    ctx.step = this.step;
  }

  private onStartTest(test: Test) {
    this.addMethodsToContext(test.ctx);
    this.currentTest = test;
    // Metadata set in `before each` hooks runs after this event, so it still reaches the test.
    this.metadataApplier.reset();
    this.outputCapture.reset();
    if (this.reporter.isCaptureLogs()) {
      this.outputCapture.install();
    }
    this.stepRunner.reset();
    this.currentType = 'test';
    this.testBeginTime = Date.now();
    this.profilerTracker.onTestStart();
  }

  private onPending(test: Mocha.Test) {
    if (this.currentTest === test) return;
    this.testBeginTime = Date.now();
  }

  /**
   * Mocha emits no EVENT_TEST_END for a test whose `before each` hook fails: the test would be
   * missing from Qase and its metadata would carry over to the next one. Report it as failed
   * with the hook's error instead.
   */
  private onFail(runnable: Mocha.Runnable, err: Error) {
    if ((runnable as { type?: string }).type !== 'hook') return;
    if (!runnable.title.startsWith('"before each" hook')) return;
    const test = this.currentTest;
    if (!test || runnable.ctx?.currentTest !== test) return;

    const failed = Object.create(test, {
      state: { value: 'failed' },
      err: { value: err },
    }) as Mocha.Test;
    this.onEndTest(failed, test);
  }

  private onEndTest(test: Mocha.Test, original: Mocha.Test = test) {
    if (this.reportedTests.has(original)) return;
    this.reportedTests.add(original);
    this.currentTest = null;

    const output = this.outputCapture.drain();
    const metadata = this.metadataApplier.get();

    if (metadata.ignore) {
      this.metadataApplier.reset();
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

    this.metadataApplier.reset();
    this.stepRunner.reset();
    this.profilerTracker.reset();
  }

  qaseId = (id: number | number[]) => {
    this.metadataApplier.applyQaseId(id);
  };

  title = (title: string) => {
    this.metadataApplier.applyTitle(title);
  };

  parameters = (values: Record<string, string>) => {
    this.metadataApplier.applyParameters(values);
  };

  groupParameters = (values: Record<string, string>) => {
    this.metadataApplier.applyGroupParameters(values);
  };

  fields = (values: Record<string, string>) => {
    this.metadataApplier.applyFields(values);
  };

  suite = (name: string) => {
    this.metadataApplier.applySuite(name);
  };

  ignore = () => {
    this.metadataApplier.applyIgnore();
  };

  mute = () => {
    this.metadataApplier.applyMute();
  };

  attach = (attach: { name?: string, paths?: string | string[], content?: Buffer | string, contentType?: string }) => {
    this.metadataApplier.applyAttach(attach);
  };

  comment = (message: string) => {
    this.metadataApplier.applyComment(message);
  };

  tags = (...values: string[]) => {
    this.metadataApplier.applyTags(values);
  };

  step = (title: string, func: () => void, expectedResult?: string, data?: string) => {
    const previousType = this.currentType;
    this.currentType = 'step';
    this.stepRunner.run(title, func, expectedResult, data);
    this.currentType = previousType;
  };
}

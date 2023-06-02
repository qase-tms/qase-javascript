import { MochaOptions, reporters, Runner, Test } from 'mocha';
import {
  OptionsType,
  QaseReporter,
  ReporterInterface,
  StatusesEnum,
} from 'qase-javascript-commons';

import { traverseDir } from './utils/traverse-dir';

const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING, EVENT_RUN_END } =
  Runner.constants;

const qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

const statusMap = {
  failed: StatusesEnum.failed,
  passed: StatusesEnum.passed,
  pending: StatusesEnum.blocked,
};

export type ReporterOptionsType = Omit<
  OptionsType,
  'frameworkName' | 'reporterName'
> & {
  screenshotsFolder?: string;
};

export type CypressQaseOptionsType = Omit<MochaOptions, 'reporterOptions'> & {
  reporterOptions: ReporterOptionsType;
};

export class CypressQaseReporter extends reporters.Base {
  private static getCaseId(title: string) {
    const [, ids] = title.match(qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  private static findAttachments(ids: number[], dir: string) {
    const idSet = new Set(ids);
    const attachments: string[] = [];

    try {
      traverseDir(dir, (filePath) => {
        if (
          CypressQaseReporter.getCaseId(filePath).some((item) =>
            idSet.has(item),
          )
        ) {
          attachments.push(filePath);
        }
      });
    } catch (error) {/* ignore */}

    return attachments;
  }

  private screenshotsFolder: string | undefined;

  private reporter: ReporterInterface;

  public constructor(runner: Runner, options: CypressQaseOptionsType) {
    super(runner, options);

    const { screenshotsFolder, ...reporterOptions } = options.reporterOptions;

    this.screenshotsFolder = screenshotsFolder;

    this.reporter = new QaseReporter({
      ...reporterOptions,
      frameworkName: 'cypress',
      reporterName: 'cypress-qase-reporter',
    });

    this.addRunnerListeners(runner);
  }

  private addRunnerListeners(runner: Runner) {
    runner.on(EVENT_TEST_PASS, (test: Test) => {
      this.addTestResult(test);
    });

    runner.on(EVENT_TEST_PENDING, (test: Test) => {
      this.addTestResult(test);
    });

    runner.on(EVENT_TEST_FAIL, (test: Test) => {
      this.addTestResult(test);
    });

    runner.once(EVENT_RUN_END, () => {
      void this.reporter.publish();
      this.preventExit();
    });
  }

  private addTestResult(test: Test) {
    const ids = CypressQaseReporter.getCaseId(test.title);
    const [id, ...restIds] = ids;

    if (id) {
      const attachments = this.screenshotsFolder
        ? CypressQaseReporter.findAttachments(ids, this.screenshotsFolder)
        : undefined;

      this.reporter.addTestResult({
        id: test.id,
        testOpsId: [id, ...restIds],
        title: test.fullTitle(),
        status: test.state ? statusMap[test.state] : StatusesEnum.invalid,
        duration: test.duration || 0,
        attachments,
      });
    }
  }

  private preventExit() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _exit = process.exit;

    const mutableProcess: Record<'exit', (code: number) => void> = process;

    mutableProcess.exit = (code: number) => {
      process.exitCode = code || 0;
      process.exit = _exit;
    };
  }
}

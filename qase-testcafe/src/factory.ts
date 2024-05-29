import { TestcafeQaseOptionsType, TestcafeQaseReporter, TestRunInfoType } from './reporter';

/**
 * @param {TestcafeQaseOptionsType} options
 * @returns
 */
export const factory = (options: TestcafeQaseOptionsType) => {
  const reporter = new TestcafeQaseReporter(options);

  return {
    noColors: false,
    reportTaskStart: () => {
      reporter.startTestRun();
    },
    reportFixtureStart: () => {
      /* empty */
    },
    reportTestDone: async (name: string, testRunInfo: TestRunInfoType, meta: Record<string, string>) => {
      await reporter.reportTestDone(name, testRunInfo, meta);
    },
    reportTaskDone: async () => {
      await reporter.reportTaskDone();
    },
  };
};

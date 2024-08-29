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
    async reportTestDone(
      name: string,
      testRunInfo: TestRunInfoType,
      meta: Record<string, string>
    ): Promise<void> {
      return reporter.reportTestDone(
        name,
        testRunInfo,
        meta,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error Inject testrail error formatting method with bound context
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        this.formatError.bind(this)
      );
    },
    reportTaskDone: async () => {
      await reporter.reportTaskDone();
    },
  };
};

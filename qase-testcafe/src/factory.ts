import { TestcafeQaseOptionsType, TestcafeQaseReporter } from "./reporter";

export const factory = (options: TestcafeQaseOptionsType) => {
  const reporter = new TestcafeQaseReporter(options);

  return {
    reportTaskStart: () => {/* empty */},
    reportFixtureStart: () => {/* empty */},
    reportTestDone: reporter.reportTestDone,
    reportTaskDone: reporter.reportTaskDone,
    reporter,
  };
};

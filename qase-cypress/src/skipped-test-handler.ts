import type { Suite, Test } from 'mocha';
import type { TestResultType } from 'qase-javascript-commons';
import type { ResultBuilder, BuildSkippedArgs } from './result-builder';
import type { TestTracker } from './test-tracker';

export type PublishFn = (result: TestResultType) => void;
export type BuildArgsFactory = (test: Test) => Omit<BuildSkippedArgs, 'test'>;

/**
 * Detects tests skipped due to a beforeEach failure (which never emit
 * TEST_PASS/PENDING/FAIL events) by walking the suite tree at SUITE_END
 * and synthesizing a skipped TestResult for each unprocessed test.
 */
export class SkippedTestHandler {
  constructor(
    private readonly tracker: TestTracker,
    private readonly resultBuilder: ResultBuilder,
    private readonly publish: PublishFn,
    private readonly buildArgsFor: BuildArgsFactory,
  ) {}

  handleSuiteEnd(suite: Suite): void {
    const allTests: Test[] = [];
    this.collectAllTestsFromSuite(suite, allTests);

    for (const test of allTests) {
      if (!this.tracker.isProcessed(test)) {
        const opts = this.buildArgsFor(test);
        const result = this.resultBuilder.buildSkipped({ test, ...opts });
        this.publish(result);
        this.tracker.markProcessed(test);
      }
    }
  }

  private collectAllTestsFromSuite(suite: Suite, tests: Test[]): void {
    const suiteTests = suite.tests ?? [];
    tests.push(...suiteTests);
    const nestedSuites = suite.suites ?? [];
    for (const nestedSuite of nestedSuites) {
      this.collectAllTestsFromSuite(nestedSuite, tests);
    }
  }
}

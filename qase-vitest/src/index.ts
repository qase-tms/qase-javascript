import type { Reporter } from 'vitest/reporters';
import type { TestAnnotation } from '@vitest/runner';
import type {
  TestSpecification,
  TestModule,
  TestCase,
  TestSuite,
  ReportedHookContext,
  SerializedError,
  TestRunEndReason,
  TestResult
} from 'vitest/node';
import {
  QaseReporter,
  TestResultType,
  TestStatusEnum,
  composeOptions,
  ReporterInterface,
  ConfigType
} from 'qase-javascript-commons';

export type VitestQaseOptionsType = ConfigType;

export class VitestQaseReporter implements Reporter {
  private reporter: ReporterInterface;
  private currentSuite: string | undefined = undefined;

  constructor(options: VitestQaseOptionsType = {}) {
    const composedOptions = composeOptions(options, {});

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'vitest',
      frameworkName: 'vitest',
      reporterName: 'vitest-qase-reporter',
    });
  }

  // Safe JSON stringify function that handles circular references
  private safeStringify(obj: any, space?: string | number): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, space);
  }

  /**
   * Extract Qase test case IDs from test annotations
   */
  private getQaseIds(testCase: TestCase): number[] {
    const qaseIds: number[] = [];

    try {
      if (testCase.annotations) {
        const annotations = testCase.annotations();
        for (const annotation of annotations) {
          // Check for both 'qase' and 'qaseid' types (case insensitive)
          const type = annotation.type?.toLowerCase();
          if ((type === 'qase' || type === 'qaseid') && (annotation as any).description) {
            const ids = (annotation as any).description.split(',').map((id: string) => parseInt(id.trim(), 10));
            qaseIds.push(...ids.filter((id: number) => !isNaN(id)));
          }
        }
      }
    } catch (error) {
      // Ignore annotation errors
    }

    // Also check test title for Qase ID pattern (e.g., "Test name [Q-123]")
    const titleMatch = testCase.name.match(/\[Q-(\d+)\]/g);
    if (titleMatch) {
      for (const match of titleMatch) {
        const id = parseInt(match.replace(/\[Q-(\d+)\]/, '$1'), 10);
        if (!isNaN(id)) {
          qaseIds.push(id);
        }
      }
    }

    return qaseIds;
  }

  /**
   * Convert Vitest test result status to Qase TestStatusEnum
   */
  private convertStatus(result: TestResult): TestStatusEnum {
    if (!result) return TestStatusEnum.skipped;

    switch (result.state) {
      case 'passed':
        return TestStatusEnum.passed;
      case 'failed':
        return TestStatusEnum.failed;
      case 'skipped':
        return TestStatusEnum.skipped;
      case 'pending':
        return TestStatusEnum.skipped;
      default:
        return TestStatusEnum.skipped;
    }
  }

  /**
   * Create TestResultType from Vitest TestCase
   */
  private createTestResult(testCase: TestCase): TestResultType {
    const result = testCase.result();
    const qaseIds = this.getQaseIds(testCase);
    const diagnostic = testCase.diagnostic();

    const testResult = new TestResultType(testCase.name);
    testResult.id = testCase.id || '';
    testResult.signature = testCase.fullName || testCase.name;

    // Set testops_id based on extracted qase IDs
    if (qaseIds.length > 0) {
      testResult.testops_id = qaseIds.length === 1 ? qaseIds[0]! : qaseIds;
    } else {
      testResult.testops_id = null;
    }

    // Set relations for test suite
    if (this.currentSuite) {
      testResult.relations = {
        suite: {
          data: [],
        },
      };

      const suites = this.currentSuite.split(' - ');
      suites.forEach((suite) => {
        testResult.relations?.suite?.data.push({ title: suite.trim(), public_id: null });
      });
    }

    // Set execution details
    testResult.execution.status = this.convertStatus(result);
    testResult.execution.start_time = diagnostic?.startTime ? diagnostic.startTime / 1000 : null;
    testResult.execution.end_time = diagnostic?.startTime ? diagnostic.startTime / 1000 + diagnostic.duration : null;
    testResult.execution.duration = Math.round(diagnostic?.duration || 0);

    if (result?.errors && result.errors.length > 0) {
      testResult.execution.stacktrace = result.errors.map((error: any) =>
        error.stack || error.message || String(error)
      ).join('\n');
      testResult.message = result.errors[0]?.message || 'Test failed';
    }

    if (result.state === 'skipped') {
      testResult.message = (result as any).note || null;
    }

    return testResult;
  }

  // use for start test run via reporter
  onTestRunStart?(_specifications: ReadonlyArray<TestSpecification>): void {
    this.reporter.startTestRun();
  }

  // use for complete test run via reporter
  async onTestRunEnd?(_testModules: ReadonlyArray<TestModule>, _unhandledErrors: ReadonlyArray<SerializedError>, _reason: TestRunEndReason): Promise<void> {
    await this.reporter.publish();
  }


  // use for collecting information about test result
  async onTestCaseResult?(testCase: TestCase): Promise<void> {
    const testResult = this.createTestResult(testCase);
    await this.reporter.addTestResult(testResult);
  }

  onTestCaseAnnotate?(testCase: TestCase, annotation: TestAnnotation): void {
    console.log('VitestQaseReporter.onTestCaseAnnotate called with:', this.safeStringify({
      testCase: {
        name: testCase.name,
        type: testCase.type
      },
      annotation
    }, 2));
  }

  // use for collecting information about test suite (save to variable and use for result reporting)
  onTestSuiteReady?(testSuite: TestSuite): void {
    this.currentSuite = testSuite.name;
  }

  // use for removing information about test suite result
  onTestSuiteResult?(_testSuite: TestSuite): void {
    this.currentSuite = undefined;
  }

  onHookStart?(hook: ReportedHookContext): void {
    console.log('VitestQaseReporter.onHookStart called with:', this.safeStringify({
      name: hook.name
    }, 2));
  }

  onHookEnd?(hook: ReportedHookContext): void {
    console.log('VitestQaseReporter.onHookEnd called with:', this.safeStringify({
      name: hook.name
    }, 2));
  }
}

export default VitestQaseReporter;

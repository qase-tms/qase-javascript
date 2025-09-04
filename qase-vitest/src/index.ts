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
  TestStepType,
  StepStatusEnum,
  Attachment,
  composeOptions,
  ReporterInterface,
  ConfigType
} from 'qase-javascript-commons';

export type VitestQaseOptionsType = ConfigType;

export class VitestQaseReporter implements Reporter {
  private reporter: ReporterInterface;
  private currentSuite: string | undefined = undefined;
  private testMetadata: Map<string, {
    title?: string;
    comment?: string;
    suite?: string;
    fields?: Record<string, string>;
    parameters?: Record<string, string>;
    groupParameters?: Record<string, string>;
    currentStep?: string;
    steps: Array<{ name: string; status: 'start' | 'end' | 'failed' }>;
    attachments: Array<{ name: string; path?: string; content?: string; contentType?: string }>;
  }> = new Map();

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
    const [, ids] = title.match(VitestQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

    /**
   * @param {string} title
   * @returns {string}
   * @private
   */
  private static removeQaseIdsFromTitle(title: string): string {
      const matches = title.match(VitestQaseReporter.qaseIdRegExp);
      if (matches) {
        return title.replace(matches[0], '').trimEnd();
      }
      return title;
  }

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
    const qaseIds = VitestQaseReporter.getCaseId(testCase.name);
    const diagnostic = testCase.diagnostic();
    const testId = testCase.id || testCase.name;
    const metadata = this.testMetadata.get(testId);

    // Use title from metadata if available, otherwise use test name
    const testTitle = metadata?.title || VitestQaseReporter.removeQaseIdsFromTitle(testCase.name);
    const testResult = new TestResultType(testTitle);
    testResult.id = testCase.id || '';
    testResult.signature = testCase.fullName || testCase.name;

    // Set testops_id based on extracted qase IDs
    if (qaseIds.length > 0) {
      testResult.testops_id = qaseIds.length === 1 ? qaseIds[0]! : qaseIds;
    } else {
      testResult.testops_id = null;
    }

    // Set relations for test suite
    const suiteToUse = metadata?.suite || this.currentSuite || this.extractSuiteFromTestCase(testCase);
    if (suiteToUse) {
      testResult.relations = {
        suite: {
          data: [],
        },
      };

      const suites = suiteToUse.split(' - ');
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

    // Add metadata from annotations
    if (metadata) {
      // Add comment if available - store in message field since execution doesn't have comment
      if (metadata.comment) {
        testResult.message = metadata.comment;
      }

      // Add fields if available
      if (metadata.fields) {
        testResult.fields = metadata.fields;
      }

      // Add parameters if available
      if (metadata.parameters) {
        testResult.params = metadata.parameters;
      }

      // Add group parameters if available
      if (metadata.groupParameters) {
        testResult.group_params = metadata.groupParameters;
      }

      // Add steps if available - create proper TestStepType objects
      if (metadata.steps.length > 0) {
        testResult.steps = metadata.steps.map(step => {
          const stepObj = new TestStepType();
          stepObj.id = Math.random().toString(36).substr(2, 9);
          stepObj.data = {
            action: step.name,
            expected_result: null,
            data: null
          };
          stepObj.execution.status = step.status === 'failed' ? StepStatusEnum.failed : StepStatusEnum.passed;
          return stepObj;
        });
      }

      // Add attachments if available
      if (metadata.attachments.length > 0) {
        testResult.attachments = metadata.attachments.map(attachment => {
          const attachmentModel: Attachment = {
            file_name: attachment.name,
            mime_type: attachment.contentType || 'application/octet-stream',
            file_path: attachment.path || null,
            content: attachment.content || '',
            size: attachment.content ? Buffer.byteLength(attachment.content) : 0,
            id: Math.random().toString(36).substr(2, 9)
          };
          return attachmentModel;
        });
      }
    }

    // Clean up metadata after processing
    this.testMetadata.delete(testId);

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
    const testId = testCase.id || testCase.name;
    
    // Initialize metadata if not exists
    if (!this.testMetadata.has(testId)) {
      this.testMetadata.set(testId, {
        steps: [],
        attachments: []
      });
    }
    
    const metadata = this.testMetadata.get(testId)!;
    
    // Process qase annotations
    // Check if this is a qase annotation by looking at the message pattern
    if (annotation.message && annotation.message.startsWith('Qase ')) {
      const qaseType = annotation.message.split(':')[0]?.replace('Qase ', '').toLowerCase().replace(' ', '-') || '';
      
      switch (qaseType) {
        case 'title':
          metadata.title = annotation.message.replace('Qase Title: ', '');
          break;
          
        case 'comment':
          metadata.comment = annotation.message.replace('Qase Comment: ', '');
          break;
          
        case 'suite':
          metadata.suite = annotation.message.replace('Qase Suite: ', '');
          break;
          
        case 'fields':
          const fieldsData = annotation.message.replace('Qase Fields: ', '');
          try {
            metadata.fields = JSON.parse(fieldsData);
          } catch (e) {
            console.warn('Failed to parse qase fields:', fieldsData);
          }
          break;
          
        case 'parameters':
          const parametersData = annotation.message.replace('Qase Parameters: ', '');
          try {
            metadata.parameters = JSON.parse(parametersData);
          } catch (e) {
            console.warn('Failed to parse qase parameters:', parametersData);
          }
          break;
          
        case 'group-parameters':
          const groupParametersData = annotation.message.replace('Qase Group Parameters: ', '');
          try {
            metadata.groupParameters = JSON.parse(groupParametersData);
          } catch (e) {
            console.warn('Failed to parse qase group parameters:', groupParametersData);
          }
          break;
          
        case 'step-start':
          const stepStartData = annotation.message.replace('Qase Step Start: ', '');
          metadata.currentStep = stepStartData;
          break;
          
        case 'step-end':
          if (metadata.currentStep) {
            metadata.steps.push({ name: metadata.currentStep, status: 'end' });
            delete metadata.currentStep;
          }
          break;
          
        case 'step-failed':
          if (metadata.currentStep) {
            metadata.steps.push({ name: metadata.currentStep, status: 'failed' });
            delete metadata.currentStep;
          }
          break;
          
        case 'attachment':
          const attachmentName = annotation.message.replace('Qase Attachment: ', '');
          const attachment = {
            name: attachmentName,
            ...(annotation.attachment?.path && { path: annotation.attachment.path }),
            ...(annotation.attachment?.body && { 
              content: typeof annotation.attachment.body === 'string' 
                ? annotation.attachment.body 
                : new TextDecoder().decode(annotation.attachment.body)
            }),
            ...(annotation.attachment?.contentType && { contentType: annotation.attachment.contentType })
          };
          metadata.attachments.push(attachment);
          break;
      }
    }
  }

  // use for collecting information about test suite (save to variable and use for result reporting)
  onTestSuiteReady?(testSuite: TestSuite): void {
    this.currentSuite = testSuite.name;
  }

  // use for removing information about test suite result
  onTestSuiteResult?(_testSuite: TestSuite): void {
    this.currentSuite = undefined;
  }

  private extractSuiteFromTestCase(testCase: TestCase): string | undefined {
    // Extract suite from testCase.fullName or testCase.name
    // Format is usually "Suite Name > Test Name" or just "Test Name"
    const fullName = testCase.fullName || testCase.name;
    const parts = fullName.split(' > ');
    
    if (parts.length > 1) {
      // Return the suite part (everything except the last part)
      return parts.slice(0, -1).join(' > ');
    }
    
    // If no suite separator found, return undefined
    // The test will be assigned to the default suite
    return undefined;
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

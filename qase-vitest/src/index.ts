import type { Reporter } from 'vitest/reporters';
import type { TestAnnotation } from '@vitest/runner';
import type {
  TestCase,
  TestSuite
} from 'vitest/node';
import {
  QaseReporter,
  TestResultType,
  TestStepType,
  StepStatusEnum,
  Attachment,
  composeOptions,
  ReporterInterface,
  ConfigType,
  determineTestStatus,
  parseProjectMappingFromTitle,
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
    steps: { name: string; status: 'start' | 'end' | 'failed' }[];
    attachments: { name: string; path?: string; content?: string; contentType?: string }[];
  }> = new Map();

  /** @deprecated Use parseProjectMappingFromTitle from qase-javascript-commons for multi-project support. */
  static qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

  constructor(options: VitestQaseOptionsType = {}) {
    const composedOptions = composeOptions(options, {});

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'vitest',
      frameworkName: 'vitest',
      reporterName: 'vitest-qase-reporter',
    });
  }




  /**
   * Create TestResultType from Vitest TestCase
   */
  private createTestResult(testCase: TestCase): TestResultType {
    const result = testCase.result();
    const parsed = parseProjectMappingFromTitle(testCase.name);
    const diagnostic = testCase.diagnostic();
    const testId = testCase.id ?? testCase.name;
    const metadata = this.testMetadata.get(testId);

    // Use title from metadata if available, otherwise use cleaned name (multi-project markers stripped)
    const testTitle = metadata?.title ?? (parsed.cleanedTitle.replace(/\s+/g, ' ').trim() || testCase.name);
    const testResult = new TestResultType(testTitle);
    testResult.id = testCase.id ?? '';
    testResult.signature = testCase.fullName ?? testCase.name;

    // Multi-project: set testops_project_mapping when any (Qase PROJECT: ids) is present
    const hasProjectMapping = Object.keys(parsed.projectMapping).length > 0;
    if (hasProjectMapping) {
      testResult.testops_project_mapping = parsed.projectMapping;
      testResult.testops_id = null;
    } else if (parsed.legacyIds.length > 0) {
      testResult.testops_id = parsed.legacyIds.length === 1 ? parsed.legacyIds[0]! : parsed.legacyIds;
    } else {
      testResult.testops_id = null;
    }

    // Set relations for test suite
    const suiteToUse = metadata?.suite ?? this.currentSuite ?? this.extractSuiteFromTestCase(testCase);
    if (suiteToUse) {
      testResult.relations = {
        suite: {
          data: [],
        },
      };

      const suites = suiteToUse.split(' - ');
      suites.forEach((suite) => {
        testResult.relations!.suite!.data.push({ title: suite.trim(), public_id: null });
      });
    }

    // Set execution details
    testResult.execution.start_time = null;
    testResult.execution.end_time = null;
    testResult.execution.duration = Math.round(diagnostic?.duration || 0);

    // Create error object for status determination
    let error: Error | null = null;
    if (result?.errors && result.errors.length > 0) {
      const firstError = result.errors[0];
      if (firstError && typeof firstError === 'object' && 'message' in firstError) {
        error = new Error(String(firstError.message));
        if ('stack' in firstError && firstError.stack) {
          error.stack = String(firstError.stack);
        }
      }
      
      testResult.execution.stacktrace = result.errors.map((error: unknown) => {
        if (error && typeof error === 'object' && 'stack' in error && 'message' in error) {
          return (error.stack as string) ?? (error.message as string) ?? String(error);
        }
        return String(error);
      }).join('\n');
      testResult.message = result.errors[0] && typeof result.errors[0] === 'object' && 'message' in result.errors[0] 
        ? String(result.errors[0].message) ?? 'Test failed'
        : 'Test failed';
    }

    // Determine status based on error type
    testResult.execution.status = determineTestStatus(error, result.state);

    if (result.state === 'skipped') {
      testResult.message = result && typeof result === 'object' && 'note' in result ? (result.note as string) ?? null : null;
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
          const stepData = this.extractAndCleanStep(step.name);
          stepObj.data = {
            action: stepData.cleanedString,
            expected_result: stepData.expectedResult,
            data: stepData.data
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

  onTestRunStart?(): void {
    this.reporter.startTestRun();
  }

  async onTestRunEnd?(): Promise<void> {
    await this.reporter.publish();
  }


  async onTestCaseResult?(testCase: TestCase): Promise<void> {
    const testResult = this.createTestResult(testCase);
    await this.reporter.addTestResult(testResult);
  }

  onTestCaseAnnotate?(testCase: TestCase, annotation: TestAnnotation): void {
    const testId = testCase.id ?? testCase.name;
    
    // Initialize metadata if not exists
    if (!this.testMetadata.has(testId)) {
      this.testMetadata.set(testId, {
        steps: [],
        attachments: []
      });
    }
    
    const metadata = this.testMetadata.get(testId);
    if (!metadata) return;
    
    // Process qase annotations
    // Check if this is a qase annotation by looking at the message pattern
    if (annotation.message && annotation.message.startsWith('Qase ')) {
      const qaseType = annotation.message.split(':')[0]?.replace('Qase ', '').toLowerCase().replace(' ', '-') ?? '';
      
      switch (qaseType) {
        case 'title': {
          metadata.title = annotation.message.replace('Qase Title: ', '');
          break;
        }
          
        case 'comment': {
          metadata.comment = annotation.message.replace('Qase Comment: ', '');
          break;
        }
          
        case 'suite': {
          metadata.suite = annotation.message.replace('Qase Suite: ', '');
          break;
        }
          
        case 'fields': {
          const fieldsData = annotation.message.replace('Qase Fields: ', '');
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const parsed = JSON.parse(fieldsData);
            if (typeof parsed === 'object' && parsed !== null) {
              metadata.fields = parsed as Record<string, string>;
            }
          } catch (e) {
            console.warn('Failed to parse qase fields:', fieldsData);
          }
          break;
        }
          
        case 'parameters': {
          const parametersData = annotation.message.replace('Qase Parameters: ', '');
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const parsed = JSON.parse(parametersData);
            if (typeof parsed === 'object' && parsed !== null) {
              metadata.parameters = parsed as Record<string, string>;
            }
          } catch (e) {
            console.warn('Failed to parse qase parameters:', parametersData);
          }
          break;
        }
          
        case 'group-parameters': {
          const groupParametersData = annotation.message.replace('Qase Group Parameters: ', '');
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const parsed = JSON.parse(groupParametersData);
            if (typeof parsed === 'object' && parsed !== null) {
              metadata.groupParameters = parsed as Record<string, string>;
            }
          } catch (e) {
            console.warn('Failed to parse qase group parameters:', groupParametersData);
          }
          break;
        }
          
        case 'step-start': {
          const stepStartData = annotation.message.replace('Qase Step Start: ', '');
          metadata.currentStep = stepStartData;
          break;
        }
          
        case 'step-end': {
          if (metadata.currentStep) {
            metadata.steps.push({ 
              name: metadata.currentStep, 
              status: 'end'
            });
            delete metadata.currentStep;
          }
          break;
        }
          
        case 'step-failed': {
          if (metadata.currentStep) {
            metadata.steps.push({ 
              name: metadata.currentStep, 
              status: 'failed'
            });
            delete metadata.currentStep;
          }
          break;
        }
          
        case 'attachment': {
          const attachmentName = annotation.message.replace('Qase Attachment: ', '');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const attachment = {
            name: attachmentName,
            ...(annotation.attachment?.path && { path: annotation.attachment.path }),
            ...(annotation.attachment?.body && {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              content: typeof annotation.attachment.body === 'string' 
                ? annotation.attachment.body 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                : new TextDecoder().decode(annotation.attachment.body)
            }),
            ...(annotation.attachment?.contentType && { contentType: annotation.attachment.contentType })
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          metadata.attachments.push(attachment);
          break;
        }
      }
    }
  }

  onTestSuiteReady?(testSuite: TestSuite): void {
    this.currentSuite = testSuite.name;
  }

  onTestSuiteResult?(): void {
    this.currentSuite = undefined;
  }

  private extractSuiteFromTestCase(testCase: TestCase): string | undefined {
    // Extract suite from testCase.fullName or testCase.name
    // Format is usually "Suite Name > Test Name" or just "Test Name"
    const fullName = testCase.fullName ?? testCase.name;
    const parts = fullName.split(' > ');
    
    if (parts.length > 1) {
      // Return the suite part (everything except the last part)
      return parts.slice(0, -1).join(' > ');
    }
    
    // If no suite separator found, return undefined
    // The test will be assigned to the default suite
    return undefined;
  }

  private extractAndCleanStep(input: string): {
    expectedResult: string | null;
    data: string | null;
    cleanedString: string
  } {
    let expectedResult: string | null = null;
    let data: string | null = null;
    let cleanedString = input;

    const hasExpectedResult = input.includes('QaseExpRes:');
    const hasData = input.includes('QaseData:');

    if (hasExpectedResult || hasData) {
      const regex = /QaseExpRes:\s*:?\s*(.*?)\s*(?=QaseData:|$)QaseData:\s*:?\s*(.*)?/;
      const match = input.match(regex);

      if (match) {
        expectedResult = match[1]?.trim() ?? null;
        data = match[2]?.trim() ?? null;

        cleanedString = input
          .replace(/QaseExpRes:\s*:?\s*.*?(?=QaseData:|$)/, '')
          .replace(/QaseData:\s*:?\s*.*/, '')
          .trim();
      }
    }

    return { expectedResult, data, cleanedString };
  }


}

export default VitestQaseReporter;

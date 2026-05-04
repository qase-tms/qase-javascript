import type { TestCase } from 'vitest/node';
import {
  Attachment,
  StepStatusEnum,
  TestResultType,
  TestStepType,
  determineTestStatus,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import { extractAndCleanStep } from 'qase-javascript-commons/internal';
import { MetadataShape } from './metadataAccumulator';

export interface BuildArgs {
  testCase: TestCase;
  metadata: MetadataShape | undefined;
  currentSuite: string | undefined;
  profilerSteps: TestStepType[];
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResultBuilder {
  static build(args: BuildArgs): TestResultType {
    const { testCase, metadata, currentSuite, profilerSteps } = args;

    const result = testCase.result();
    const parsed = parseProjectMappingFromTitle(testCase.name);
    const diagnostic = testCase.diagnostic();

    const testTitle = metadata?.title ?? (parsed.cleanedTitle.replace(/\s+/g, ' ').trim() || testCase.name);
    const testResult = new TestResultType(testTitle);
    testResult.id = testCase.id;
    testResult.signature = testCase.fullName;

    const hasProjectMapping = Object.keys(parsed.projectMapping).length > 0;
    if (hasProjectMapping) {
      testResult.testops_project_mapping = parsed.projectMapping;
      testResult.testops_id = null;
    } else if (parsed.legacyIds.length > 0) {
      testResult.testops_id = parsed.legacyIds.length === 1 ? (parsed.legacyIds[0] ?? null) : parsed.legacyIds;
    } else {
      testResult.testops_id = null;
    }

    const suiteToUse = metadata?.suite ?? currentSuite ?? ResultBuilder.extractSuiteFromTestCase(testCase);
    if (suiteToUse) {
      testResult.relations = { suite: { data: [] } };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const suiteData = testResult.relations.suite!.data;
      const suites = suiteToUse.split(' - ');
      suites.forEach((suite) => {
        suiteData.push({ title: suite.trim(), public_id: null });
      });
    }

    testResult.execution.start_time = null;
    testResult.execution.end_time = null;
    testResult.execution.duration = Math.round(diagnostic?.duration ?? 0);

    let error: Error | null = null;
    if (result.errors && result.errors.length > 0) {
      const firstError = result.errors[0];
      if (firstError) {
        error = new Error(firstError.message);
        if (firstError.stack) {
          error.stack = firstError.stack;
        }
      }

      testResult.execution.stacktrace = result.errors.map((err) => {
        return err.stack ?? err.message;
      }).join('\n');
      testResult.message = firstError ? firstError.message : 'Test failed';
    }

    testResult.execution.status = determineTestStatus(error, result.state);

    if (result.state === 'skipped') {
      testResult.message = result.note ?? null;
    }

    if (metadata) {
      if (metadata.comment) {
        testResult.message = metadata.comment;
      }
      if (metadata.fields) {
        testResult.fields = metadata.fields;
      }
      if (metadata.parameters) {
        testResult.params = metadata.parameters;
      }
      if (metadata.groupParameters) {
        testResult.group_params = metadata.groupParameters;
      }
      if (metadata.tags && metadata.tags.length > 0) {
        testResult.tags = metadata.tags;
      }
      if (metadata.steps.length > 0) {
        testResult.steps = metadata.steps.map((step) => {
          const stepObj = new TestStepType();
          stepObj.id = Math.random().toString(36).substr(2, 9);
          const stepData = extractAndCleanStep(step.name);
          stepObj.data = {
            action: stepData.cleanedString,
            expected_result: stepData.expectedResult,
            data: stepData.data,
          };
          stepObj.execution.status = step.status === 'failed' ? StepStatusEnum.failed : StepStatusEnum.passed;
          return stepObj;
        });
      }
      if (metadata.attachments.length > 0) {
        testResult.attachments = metadata.attachments.map((attachment) => {
          const attachmentModel: Attachment = {
            file_name: attachment.name,
            mime_type: attachment.contentType ?? 'application/octet-stream',
            file_path: attachment.path ?? null,
            content: attachment.content ?? '',
            size: attachment.content ? Buffer.byteLength(attachment.content) : 0,
            id: Math.random().toString(36).substr(2, 9),
          };
          return attachmentModel;
        });
      }
    }

    if (metadata?._profilerSteps) {
      testResult.steps = [...testResult.steps, ...metadata._profilerSteps];
    }

    if (profilerSteps.length > 0) {
      testResult.steps = [...testResult.steps, ...profilerSteps];
    }

    return testResult;
  }

  static extractSuiteFromTestCase(testCase: TestCase): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const fullName = testCase.fullName ?? testCase.name;
    const parts = fullName.split(' > ');
    if (parts.length > 1) {
      return parts.slice(0, -1).join(' > ');
    }
    return undefined;
  }
}

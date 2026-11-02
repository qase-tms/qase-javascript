import path from 'path';
import type { TestCase } from 'vitest/node';
import {
  Attachment,
  StepStatusEnum,
  TestResultType,
  TestStepType,
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import { extractAndCleanStep, normalizeSuitePart } from 'qase-javascript-commons/internal';
import { MetadataShape, StepRecord } from './metadataAccumulator';

export interface BuildArgs {
  testCase: TestCase;
  metadata: MetadataShape | undefined;
  profilerSteps: TestStepType[];
}

export class ResultBuilder {
  static build(args: BuildArgs): TestResultType {
    const { testCase, metadata, profilerSteps } = args;

    const result = testCase.result();
    const parsed = parseProjectMappingFromTitle(testCase.name);
    const diagnostic = testCase.diagnostic();

    const testTitle = metadata?.title ?? (parsed.cleanedTitle.replace(/\s+/g, ' ').trim() || testCase.name);
    const testResult = new TestResultType(testTitle);
    testResult.id = testCase.id;

    const hasProjectMapping = Object.keys(parsed.projectMapping).length > 0;
    if (hasProjectMapping) {
      testResult.testops_project_mapping = parsed.projectMapping;
      testResult.testops_id = null;
    } else if (parsed.legacyIds.length > 0) {
      testResult.testops_id = parsed.legacyIds.length === 1 ? (parsed.legacyIds[0] ?? null) : parsed.legacyIds;
    } else {
      testResult.testops_id = null;
    }

    const describeTitles = ResultBuilder.getDescribeTitles(testCase);
    if (metadata?.suite) {
      testResult.relations = { suite: { data: [] } };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const suiteData = testResult.relations.suite!.data;
      // A tab (or the two characters `\t`, as the docs write it) nests suites; ` - ` always has.
      metadata.suite.split(/\t|\\t| - /).filter((suite) => suite.trim()).forEach((suite) => {
        suiteData.push({ title: suite.trim(), public_id: null });
      });
    } else if (describeTitles.length > 0) {
      testResult.relations = {
        suite: { data: describeTitles.map((title) => ({ title, public_id: null })) },
      };
    }

    testResult.signature = generateSignature(
      hasProjectMapping ? null : parsed.legacyIds,
      [
        ...ResultBuilder.getModulePath(testCase),
        ...describeTitles.map(normalizeSuitePart),
        normalizeSuitePart(parsed.cleanedTitle.replace(/\s+/g, ' ').trim() || testCase.name),
      ],
      metadata?.parameters ?? {},
    );

    // Vitest's `testCase.diagnostic()` exposes both the absolute `startTime`
    // (ms since epoch) and elapsed `duration` (ms). end_time is derived as
    // start + duration so there is no dependency on the reporter callback delay.
    const durationMs = Math.round(diagnostic?.duration ?? 0);
    if (diagnostic) {
      testResult.execution.start_time = diagnostic.startTime / 1000;
      testResult.execution.end_time = (diagnostic.startTime + durationMs) / 1000;
    } else {
      testResult.execution.start_time = null;
      testResult.execution.end_time = null;
    }
    testResult.execution.duration = durationMs;

    let error: Error | null = null;
    // A test that passes on a retry keeps the errors of its failed attempts; it still passed.
    if (result.state !== 'passed' && result.errors && result.errors.length > 0) {
      // Errors accumulate over retries; the last one is from the attempt that decided the result.
      const lastError = result.errors[result.errors.length - 1];
      if (lastError) {
        error = new Error(lastError.message);
        if (lastError.stack) {
          error.stack = lastError.stack;
        }
      }

      testResult.execution.stacktrace = result.errors.map((err) => {
        return err.stack ?? err.message;
      }).join('\n');
      testResult.message = lastError ? lastError.message : 'Test failed';
    }

    testResult.execution.status = determineTestStatus(error, result.state);

    if (result.state === 'skipped') {
      testResult.message = result.note ?? null;
    }

    if (metadata) {
      if (metadata.comment) {
        testResult.message = testResult.message
          ? `${metadata.comment}\n\n${testResult.message}`
          : metadata.comment;
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
      if (metadata.muted) {
        testResult.muted = true;
      }
      if (metadata.steps.length > 0) {
        testResult.steps = ResultBuilder.buildSteps(metadata.steps, null);
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

  private static buildSteps(steps: StepRecord[], parentId: string | null): TestStepType[] {
    return steps.map((step) => {
      const stepObj = new TestStepType();
      stepObj.id = Math.random().toString(36).substr(2, 9);
      stepObj.parent_id = parentId;
      const stepData = extractAndCleanStep(step.name);
      stepObj.data = {
        action: stepData.cleanedString,
        expected_result: stepData.expectedResult,
        data: stepData.data,
      };
      // A step still open when the test ended did not finish (the test timed out or was aborted).
      stepObj.execution.status = step.status === 'end' ? StepStatusEnum.passed : StepStatusEnum.failed;
      stepObj.steps = ResultBuilder.buildSteps(step.steps, stepObj.id);
      return stepObj;
    });
  }

  // Read from the test's own parents: suite events of files running in parallel interleave.
  static getDescribeTitles(testCase: TestCase): string[] {
    const titles: string[] = [];
    let parent: TestCase['parent'] = testCase.parent;
    while (parent.type === 'suite') {
      titles.unshift(parent.name);
      parent = parent.parent;
    }
    return titles;
  }

  private static getModulePath(testCase: TestCase): string[] {
    const moduleId = testCase.module.moduleId;
    const root = testCase.project.config.root;
    return path.relative(root, moduleId).split(path.sep).filter((part) => part.length > 0);
  }
}

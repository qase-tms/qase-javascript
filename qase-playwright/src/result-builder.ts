import { TestCase, TestError, TestResult } from '@playwright/test/reporter';
import {
  Attachment,
  CompoundError,
  TestResultType,
  TestStepType,
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import { removeQaseIdsFromTitle } from 'qase-javascript-commons/internal';
import { v4 as uuidv4 } from 'uuid';
import { ReporterOptionsType } from './options';
import { StepConverter } from './step-converter';
import { TestCaseMetadata } from './metadata-extractor';

const PROFILER_CONTENT_TYPE = 'application/qase.profiler-steps+json';
const logMimeType = 'text/plain';

export interface BuildArgs {
  test: TestCase;
  result: TestResult;
  metadata: TestCaseMetadata;
  annotations: {
    ids: number[];
    projectMapping: Record<string, number[]> | null;
    suites: string[];
  };
  options: ReporterOptionsType;
  isCaptureLogs: boolean;
  qaseIdsRegistry: ReadonlyMap<string, number[]>;
}

export class ResultBuilder {
  constructor(private readonly stepConverter: StepConverter) {}

  build(args: BuildArgs): TestResultType | null {
    const { test, result, metadata, annotations, options, isCaptureLogs, qaseIdsRegistry } = args;

    if (metadata.ignore) {
      return null;
    }

    const error = result.error ? transformError(result.errors) : null;

    let suites = annotations.suites.length > 0
      ? annotations.suites
      : (metadata.suite ? [metadata.suite] : transformSuiteTitle(test));

    let message: string | null = null;
    if (metadata.comment !== '') {
      message = metadata.comment;
    }
    if (error) {
      if (message) {
        message += '\n\n';
      } else {
        message = '';
      }
      message += error.message;
    }

    if (options.browser?.addAsParameter) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const browser = (test as any)._projectId ?? null;
      if (browser) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        metadata.parameters[options.browser?.parameterName ?? 'browser'] = browser;
        suites = suites.filter((suite) => suite !== browser);
      }
    }

    if (options.markAsFlaky && result.status === 'passed' && result.retry > 0) {
      metadata.fields['is_flaky'] = 'true';
    }

    const titleParsed = parseProjectMappingFromTitle(test.title);
    const testTitle = titleParsed.cleanedTitle || removeQaseIdsFromTitle(test.title);

    const hasMetadataProjectMapping = metadata.projectMapping != null && Object.keys(metadata.projectMapping).length > 0;
    const hasAnnotationProjectMapping = annotations.projectMapping != null && Object.keys(annotations.projectMapping).length > 0;
    const hasTitleProjectMapping = titleParsed.projectMapping != null && Object.keys(titleParsed.projectMapping).length > 0;

    const projectMapping = hasMetadataProjectMapping
      ? metadata.projectMapping ?? null
      : hasAnnotationProjectMapping
        ? annotations.projectMapping
        : hasTitleProjectMapping
          ? titleParsed.projectMapping
          : null;

    const hasProjectMapping = projectMapping != null && Object.keys(projectMapping).length > 0;

    let testops_id: number | number[] | null;
    let testops_project_mapping: Record<string, number[]> | null;
    if (hasProjectMapping) {
      testops_project_mapping = projectMapping;
      testops_id = null;
    } else if (annotations.ids.length > 0) {
      testops_id = annotations.ids.length === 1 ? annotations.ids[0]! : annotations.ids;
      testops_project_mapping = null;
    } else if (metadata.ids.length > 0) {
      testops_id = metadata.ids.length === 1 ? metadata.ids[0]! : metadata.ids;
      testops_project_mapping = null;
    } else if (titleParsed.legacyIds.length > 0) {
      testops_id = titleParsed.legacyIds.length === 1 ? titleParsed.legacyIds[0]! : titleParsed.legacyIds;
      testops_project_mapping = null;
    } else {
      const registryIds = qaseIdsRegistry.get(test.title);
      testops_id = registryIds && registryIds.length > 0 ? registryIds : null;
      testops_project_mapping = null;
    }

    let errorForStatus: Error | null = null;
    if (error) {
      errorForStatus = new Error(error.message || 'Test failed');
      if (error.stacktrace) {
        errorForStatus.stack = error.stacktrace;
      }
    }
    const testStatus = determineTestStatus(errorForStatus, result.status);
    const idsForSignature = testops_id == null ? null : (Array.isArray(testops_id) ? testops_id : [testops_id]);

    const testResult = {
      attachments: metadata.attachments,
      author: null,
      execution: {
        status: testStatus,
        start_time: result.startTime.valueOf() / 1000,
        end_time: (result.startTime.valueOf() + result.duration) / 1000,
        duration: result.duration,
        stacktrace: error === null
          ? null
          : error.stacktrace === undefined
            ? null
            : error.stacktrace,
        thread: process.ppid.toString() + '-' + result.parallelIndex.toString(),
      },
      fields: metadata.fields,
      id: uuidv4(),
      message,
      muted: false,
      params: metadata.parameters,
      group_params: metadata.groupParams,
      tags: metadata.tags ?? [],
      relations: {
        suite: {
          data: suites
            .filter((suite) => suite !== test.title)
            .map((suite) => ({ title: suite, public_id: null })),
        },
      },
      run_id: null,
      signature: generateSignature(idsForSignature, suites, metadata.parameters),
      steps: this.stepConverter.transform(result.steps, null),
      testops_id,
      testops_project_mapping,
      title: metadata.title === '' ? testTitle : metadata.title,
    };

    if (isCaptureLogs) {
      if (result.stdout.length > 0) {
        testResult.attachments.push(convertLogsToAttachments(result.stdout, 'stdout.log'));
      }
      if (result.stderr.length > 0) {
        testResult.attachments.push(convertLogsToAttachments(result.stderr, 'stderr.log'));
      }
    }

    const profilerAttachment = result.attachments.find(
      (a) => a.contentType === PROFILER_CONTENT_TYPE,
    );
    if (profilerAttachment?.body) {
      try {
        const profilerSteps = JSON.parse(profilerAttachment.body.toString()) as TestStepType[];
        testResult.steps = [...testResult.steps, ...profilerSteps];
      } catch {
        // Silent failure — corrupted profiler data must not affect test results
      }
    }

    return testResult as unknown as TestResultType;
  }
}

function transformError(testErrors: TestError[]): CompoundError {
  const compound = new CompoundError();
  for (const e of testErrors) {
    if (e.message == undefined) continue;
    compound.addMessage(e.message);
  }
  for (const e of testErrors) {
    if (e.stack == undefined) continue;
    compound.addStacktrace(e.stack);
  }
  return compound;
}

function transformSuiteTitle(test: TestCase): string[] {
  return test.titlePath().filter(Boolean).map((s) => s.replace(/\\/g, '/'));
}

function convertLogsToAttachments(logs: (string | Buffer)[], name: string): Attachment {
  let content = '';
  for (const line of logs) {
    content = content + line.toString();
  }
  return {
    file_name: name,
    mime_type: logMimeType,
    content,
  } as Attachment;
}

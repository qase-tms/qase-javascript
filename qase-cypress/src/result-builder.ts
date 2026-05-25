import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Suite, Test } from 'mocha';
import {
  Attachment,
  StepRequestData,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTags,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import {
  removeQaseIdsFromTitle,
  getFile as getFileFromNode,
  normalizeSuitePart,
  FileSuiteNode,
} from 'qase-javascript-commons/internal';
import { FileSearcher } from './fileSearcher';
import { extractTags } from './utils/tagParser';
import type { Metadata } from './metadata/models';
import type { ReporterOptionsType } from './options';
import { StepConverter } from './step-converter';

const getFile = (suite: Suite): string | undefined =>
  getFileFromNode(suite as unknown as FileSuiteNode);

export interface BuildArgs {
  test: Test;
  metadata: Metadata | undefined;
  screenshotsFolder: string | undefined;
  testBeginTime: number;
  isCucumber: boolean;
  options: ReporterOptionsType;
}

export interface BuildSkippedArgs {
  test: Test;
  screenshotsFolder: string | undefined;
  testBeginTime: number;
}

export class ResultBuilder {
  constructor(private readonly stepConverter: StepConverter) {}

  build(args: BuildArgs): TestResultType | null {
    const { test, metadata, screenshotsFolder, testBeginTime } = args;
    if (metadata?.ignore) {
      return null;
    }

    const end_time = Date.now();
    const duration = end_time - testBeginTime;

    const fromTitle = parseProjectMappingFromTitle(test.title);
    const legacyIds = [...fromTitle.legacyIds];
    const projectMapping: Record<string, number[]> = { ...fromTitle.projectMapping };

    const testFileName = getTestFileName(test);
    const files = screenshotsFolder
      ? FileSearcher.findFilesBeforeTime(screenshotsFolder, testFileName, new Date(testBeginTime))
      : [];

    const attachments = files.map((file) => ({
      content: '',
      id: uuidv4(),
      mime_type: 'image/png',
      size: 0,
      file_name: path.basename(file),
      file_path: file,
    } as Attachment));

    attachments.push(...(metadata?.attachments ?? []));

    let relations = {};
    if (test.parent !== undefined) {
      const data = [];
      for (const suite of test.parent.titlePath()) {
        data.push({ title: suite, public_id: null });
      }
      relations = { suite: { data } };
    }
    if (metadata?.suite) {
      relations = { suite: { data: [{ title: metadata.suite, public_id: null }] } };
    }

    let message = metadata?.comment ?? '';
    if (test.err?.message) {
      message += message ? `\n\n${test.err.message}` : test.err.message;
    }

    const steps = metadata?.steps
      ? this.stepConverter.getSteps(metadata.steps, metadata.stepAttachments ?? {})
      : [];

    if (metadata?.cucumberSteps && metadata.cucumberSteps.length > 0) {
      steps.push(...this.stepConverter.convertCypressMessages(metadata.cucumberSteps, test.state ?? 'failed'));
      if (test.parent) {
        const file = getFile(test.parent);
        if (file) {
          const tags = extractTags(file, test.title);
          const fromTags = parseProjectMappingFromTags(tags);
          legacyIds.push(...fromTags.legacyIds);
          for (const [code, idsFromTag] of Object.entries(fromTags.projectMapping)) {
            projectMapping[code] = [...(projectMapping[code] ?? []), ...idsFromTag];
          }
        }
      }
    }

    if (metadata?.networkRequests && metadata.networkRequests.length > 0) {
      for (const req of metadata.networkRequests) {
        const step = new TestStepType(StepType.REQUEST);
        step.id = uuidv4();
        const data = step.data as StepRequestData;
        data.request_method = req.method;
        data.request_url = req.url;
        data.request_headers = null;
        data.request_body = null;
        data.status_code = req.statusCode;
        data.response_body = req.responseBody;
        data.response_headers = null;
        step.execution.status = req.statusCode !== null && req.statusCode >= 400
          ? StepStatusEnum.failed
          : StepStatusEnum.passed;
        // req.startTime is ms-since-epoch, req.duration is elapsed ms.
        // Qase API expects start_time/end_time in Unix seconds (with fractional ms)
        // and duration in milliseconds.
        step.execution.start_time = req.startTime / 1000;
        step.execution.end_time = (req.startTime + req.duration) / 1000;
        step.execution.duration = req.duration;
        steps.push(step);
      }
    }

    const hasProjectMapping = Object.keys(projectMapping).length > 0;
    const result: TestResultType = {
      attachments,
      author: null,
      fields: metadata?.fields ?? {},
      tags: metadata?.tags ?? [],
      message,
      muted: false,
      params: metadata?.parameters ?? {},
      group_params: metadata?.groupParams ?? {},
      relations,
      run_id: null,
      signature: getSignature(test, hasProjectMapping ? [] : legacyIds, metadata?.parameters ?? {}),
      steps,
      id: uuidv4(),
      execution: {
        status: determineTestStatus(test.err ?? null, test.state ?? 'failed'),
        start_time: testBeginTime / 1000,
        end_time: end_time / 1000,
        duration,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: !hasProjectMapping && legacyIds.length > 0
        ? (legacyIds.length === 1 ? legacyIds[0]! : legacyIds)
        : null,
      testops_project_mapping: hasProjectMapping ? projectMapping : null,
      title: metadata?.title ?? (fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title)),
      preparedAttachments: [],
    } as unknown as TestResultType;

    return result;
  }

  buildSkipped(args: BuildSkippedArgs): TestResultType {
    const { test, screenshotsFolder, testBeginTime } = args;
    const end_time = Date.now();
    const start_time = testBeginTime || Date.now();

    const fromTitle = parseProjectMappingFromTitle(test.title);
    const legacyIds = [...fromTitle.legacyIds];
    const projectMapping: Record<string, number[]> = { ...fromTitle.projectMapping };

    const testFileName = getTestFileName(test);
    const files = screenshotsFolder
      ? FileSearcher.findFilesBeforeTime(screenshotsFolder, testFileName, new Date(start_time))
      : [];

    const attachments = files.map((file) => ({
      content: '',
      id: uuidv4(),
      mime_type: 'image/png',
      size: 0,
      file_name: path.basename(file),
      file_path: file,
    } as Attachment));

    let relations = {};
    if (test.parent !== undefined) {
      const data = [];
      for (const suite of test.parent.titlePath()) {
        data.push({ title: suite, public_id: null });
      }
      relations = { suite: { data } };
    }

    if (test.parent) {
      const file = getFile(test.parent);
      if (file) {
        const tags = extractTags(file, test.title);
        const fromTags = parseProjectMappingFromTags(tags);
        legacyIds.push(...fromTags.legacyIds);
        for (const [code, idsFromTag] of Object.entries(fromTags.projectMapping)) {
          projectMapping[code] = [...(projectMapping[code] ?? []), ...idsFromTag];
        }
      }
    }

    const hasProjectMapping = Object.keys(projectMapping).length > 0;
    const result: TestResultType = {
      attachments,
      author: null,
      fields: {},
      message: null,
      muted: false,
      params: {},
      group_params: {},
      relations,
      run_id: null,
      signature: getSignature(test, hasProjectMapping ? [] : legacyIds, {}),
      steps: [],
      id: uuidv4(),
      execution: {
        status: TestStatusEnum.skipped,
        start_time: testBeginTime / 1000,
        end_time: end_time / 1000,
        duration: 0,
        stacktrace: null,
        thread: null,
      },
      testops_id: !hasProjectMapping && legacyIds.length > 0
        ? (legacyIds.length === 1 ? legacyIds[0]! : legacyIds)
        : null,
      testops_project_mapping: hasProjectMapping ? projectMapping : null,
      title: fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title),
      preparedAttachments: [],
    } as unknown as TestResultType;

    return result;
  }
}

function getSignature(test: Test, ids: number[], params: Record<string, string>): string {
  const suites: string[] = [];
  const file = test.parent ? getFile(test.parent) : undefined;

  if (file) {
    suites.push(file.split(path.sep).join('::'));
  }
  if (test.parent) {
    for (const suite of test.parent.titlePath()) {
      suites.push(normalizeSuitePart(suite));
    }
  }
  suites.push(normalizeSuitePart(test.title));

  return generateSignature(ids, suites, params);
}

function getTestFileName(test: Test): string {
  if (!test.parent) {
    return '';
  }
  const file = getFile(test.parent);
  if (!file) {
    return '';
  }
  const pathParts = file.split(path.sep);
  const fileName = pathParts[pathParts.length - 1];
  return fileName ? fileName : '';
}

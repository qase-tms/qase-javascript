import { v4 as uuidv4 } from 'uuid';
import {
  Attachment,
  TestStatusEnum,
  TestStepType,
  TestResultType,
  generateSignature,
  determineTestStatus,
} from 'qase-javascript-commons';
import { normalizeSuitePart } from 'qase-javascript-commons/internal';
import {
  FixtureType,
  MetadataType,
  ScreenshotType,
  TestRunInfoType,
  metadataEnum,
} from '../types';
import { ReporterOptionsType } from '../options';

export interface BuildArgs {
  title: string;
  testRunInfo: TestRunInfoType;
  metadata: MetadataType;
  formatError: (error: unknown, prefix: string) => string;
  steps: TestStepType[];
  attachments: Attachment[];
  profilerSteps: TestStepType[];
  testBeginTime: number;
  browserName: string | null;
  browserOptions: ReporterOptionsType['browser'];
}

export class ResultBuilder {
  static build(args: BuildArgs): TestResultType {
    const {
      title,
      testRunInfo,
      metadata,
      formatError,
      steps,
      attachments,
      profilerSteps,
      testBeginTime,
      browserName,
      browserOptions,
    } = args;

    const errorLog = testRunInfo.errs
      .map((error, index) =>
        formatError(error, `${index + 1} `).replace(
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          '',
        ),
      )
      .join('\n');

    const screenshotAttachments = ResultBuilder.transformAttachments(testRunInfo.screenshots);
    const allAttachments = [...screenshotAttachments, ...attachments];

    const params: Record<string, string> = { ...metadata[metadataEnum.parameters] };
    if (browserOptions?.addAsParameter && browserName) {
      const paramName = browserOptions.parameterName ?? 'browser';
      params[paramName] = browserName;
    }

    const projectMapping = metadata[metadataEnum.projects];
    const hasProjectMapping = projectMapping && Object.keys(projectMapping).length > 0;

    return {
      author: null,
      execution: {
        status: ResultBuilder.getStatus(testRunInfo),
        start_time: testBeginTime / 1000,
        end_time: (testBeginTime + testRunInfo.durationMs) / 1000,
        duration: testRunInfo.durationMs,
        stacktrace: errorLog,
        thread: null,
      },
      fields: metadata[metadataEnum.fields],
      tags: metadata[metadataEnum.tags],
      message: errorLog ? errorLog.split('\n')[0] ?? '' : '',
      muted: false,
      params,
      group_params: metadata[metadataEnum.groupParameters],
      relations: {
        suite: {
          data: metadata[metadataEnum.suite]
            ? metadata[metadataEnum.suite]!.split('\t').map((s) => ({
                title: s,
                public_id: null,
              }))
            : [
                {
                  title: testRunInfo.fixture.name,
                  public_id: null,
                },
              ],
        },
      },
      run_id: null,
      signature: ResultBuilder.getSignature(
        testRunInfo.fixture,
        title,
        metadata[metadataEnum.id],
        params,
      ),
      steps: [...steps, ...profilerSteps],
      id: uuidv4(),
      testops_id: metadata[metadataEnum.id].length > 0 ? metadata[metadataEnum.id] : null,
      title: metadata[metadataEnum.title] !== undefined ? metadata[metadataEnum.title] : title,
      attachments: allAttachments,
      testops_project_mapping: hasProjectMapping ? projectMapping : null,
    } as unknown as TestResultType;
  }

  static getStatus(testRunInfo: TestRunInfoType): TestStatusEnum {
    if (testRunInfo.skipped) {
      return TestStatusEnum.skipped;
    } else if (testRunInfo.errs.length > 0) {
      const firstError = testRunInfo.errs[0];
      const error = new Error(firstError?.errMsg ?? 'Test failed');
      if (firstError?.callsite) {
        const filename = firstError.callsite.filename ?? 'unknown';
        const lineNum = firstError.callsite.lineNum ?? 'unknown';
        error.stack = `Error: ${firstError.errMsg}\n    at ${filename}:${lineNum}`;
      }
      return determineTestStatus(error, 'failed');
    }
    return TestStatusEnum.passed;
  }

  static transformAttachments(screenshots: ScreenshotType[]): Attachment[] {
    const attachments: Attachment[] = [];
    for (const screenshot of screenshots) {
      attachments.push({
        file_name: screenshot.screenshotPath,
        file_path: screenshot.screenshotPath,
        mime_type: '',
        content: '',
        size: 0,
        id: uuidv4(),
      });
    }
    return attachments;
  }

  static getSignature(
    fixture: FixtureType,
    title: string,
    ids: number[],
    parameters: Record<string, string>,
  ): string {
    const executionPath = process.cwd() + '/';
    const path = fixture.path?.replace(executionPath, '') ?? '';
    const suites: string[] = [];

    if (path !== '') {
      suites.push(...path.split('/'));
    }

    suites.push(normalizeSuitePart(fixture.name));
    suites.push(normalizeSuitePart(title));

    return generateSignature(ids, suites, parameters);
  }
}

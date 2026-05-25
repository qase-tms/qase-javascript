import has from 'lodash.has';
import get from 'lodash.get';
import { v4 as uuidv4 } from 'uuid';
import { AssertionResult } from '@jest/test-result';
import {
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTitle,
  Relation,
  Suite,
  TestResultType,
  TestStepType,
} from 'qase-javascript-commons';
import {
  normalizeSuitePart,
  removeQaseIdsFromTitle,
} from 'qase-javascript-commons/internal';
import { Metadata } from '../models';

const QASE_ID_REGEXP = /\(Qase ID: ([\d,]+)\)/;

export interface ResultBuilderArgs {
  value: AssertionResult;
  path: string;
  metadata: Metadata;
  profilerSteps: TestStepType[];
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResultBuilder {

  static build(args: ResultBuilderArgs): TestResultType {
    const { value, path, metadata, profilerSteps } = args;

    let error: Error | undefined;
    if (value.status === 'failed') {
      const message = value.failureDetails
        .map((item) =>
          has(item, 'matcherResult.message')
            ? String(get(item, 'matcherResult.message'))
            : 'Runtime exception',
        )
        .join('\n\n');
      error = new Error(message);
      error.stack = value.failureMessages.join('\n\n');
    }

    const parsed = parseProjectMappingFromTitle(value.title);
    const filePath = ResultBuilder.normalizePath(path);
    const hasProjectMapping = Object.keys(parsed.projectMapping).length > 0;
    const ids = hasProjectMapping ? [] : parsed.legacyIds;

    const testStatus = determineTestStatus(error ?? null, value.status);

    // Jest's AssertionResult does not expose absolute test start/end timestamps,
    // only an elapsed `duration` (ms). Approximate the absolute window relative
    // to the moment we observed the result; the reporter callback delay is the
    // only loss of precision, typically negligible on a real test run.
    const durationMs = value.duration ?? 0;
    const endTimeMs = Date.now();
    const startTimeMs = endTimeMs - durationMs;

    const result: TestResultType = {
      attachments: [],
      author: null,
      execution: {
        status: testStatus,
        start_time: startTimeMs / 1000,
        end_time: endTimeMs / 1000,
        duration: durationMs,
        stacktrace: error?.stack ?? null,
        thread: null,
      },
      fields: {},
      message: error?.message ?? null,
      muted: false,
      params: {},
      group_params: {},
      relations: ResultBuilder.getRelations(filePath, value.ancestorTitles),
      run_id: null,
      signature: ResultBuilder.getSignature(filePath, value.fullName, ids, {}),
      steps: [],
      testops_id:
        parsed.legacyIds.length > 0 && !hasProjectMapping
          ? parsed.legacyIds.length === 1
            ? (parsed.legacyIds[0] ?? null)
            : parsed.legacyIds
          : null,
      testops_project_mapping: hasProjectMapping ? parsed.projectMapping : null,
      id: uuidv4(),
      title: parsed.cleanedTitle || removeQaseIdsFromTitle(value.title),
    } as unknown as TestResultType;

    if (metadata.title) {
      result.title = metadata.title;
    }
    if (metadata.comment) {
      result.message = metadata.comment;
    }
    if (metadata.suite) {
      result.relations = {
        suite: {
          data: [{ title: metadata.suite, public_id: null }],
        },
      };
    }
    if (Object.keys(metadata.fields).length > 0) {
      result.fields = metadata.fields;
    }
    if (Object.keys(metadata.parameters).length > 0) {
      result.params = metadata.parameters;
    }
    if (Object.keys(metadata.groupParams).length > 0) {
      result.group_params = metadata.groupParams;
    }
    if (metadata.tags.length > 0) {
      result.tags = metadata.tags;
    }
    if (metadata.steps.length > 0) {
      result.steps = metadata.steps;
    }
    if (metadata.attachments.length > 0) {
      result.attachments = metadata.attachments;
    }

    const idsForSignature = ResultBuilder.getCaseId(value.title);
    result.signature = ResultBuilder.getSignature(
      filePath,
      value.fullName,
      idsForSignature,
      metadata.parameters,
    );

    if (profilerSteps.length > 0) {
      result.steps = [...result.steps, ...profilerSteps];
    }

    return result;
  }

  static getSignature(
    filePath: string,
    fullName: string,
    ids: number[],
    parameters: Record<string, string> = {},
  ): string {
    const suites = filePath.split('/');
    suites.push(normalizeSuitePart(fullName));
    return generateSignature(ids, suites, parameters);
  }

  static getRelations(filePath: string, suites: string[]): Relation {
    const suite: Suite = { data: [] };
    for (const part of filePath.split('/')) {
      suite.data.push({ title: part, public_id: null });
    }
    for (const part of suites) {
      suite.data.push({ title: part, public_id: null });
    }
    return { suite };
  }

  static normalizePath(fullPath: string): string {
    const executionPath = process.cwd() + '/';
    return fullPath.replace(executionPath, '');
  }

  private static getCaseId(title: string): number[] {
    const m = title.match(QASE_ID_REGEXP);
    return m?.[1] ? m[1].split(',').map((id) => Number(id)) : [];
  }
}

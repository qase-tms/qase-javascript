import { Pickle, TestCaseFinished, TestCaseStarted } from '@cucumber/messages';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import {
  Attachment,
  CompoundError,
  generateSignature,
  Relation,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { TestMetadata } from '../models';

export interface BuildArgs {
  testCaseFinished: TestCaseFinished;
  testCaseStarted: TestCaseStarted;
  testCase: TestCase;
  pickle: Pickle;
  metadata: TestMetadata;
  status: TestStatusEnum;
  error: CompoundError | undefined;
  steps: TestStepType[];
  profilerSteps: TestStepType[];
  attachments: Attachment[];
  scenarioName: string | undefined;
  scenarioParameters: Record<string, string>;
}

export class ResultBuilder {
  static build(args: BuildArgs): TestResultType {
    const {
      testCaseFinished,
      testCaseStarted,
      pickle,
      metadata,
      status,
      error,
      steps,
      profilerSteps,
      attachments,
      scenarioName,
      scenarioParameters,
    } = args;

    let relations: Relation | null = null;

    if (metadata.suite) {
      const suiteParts = metadata.suite.split('\t').filter((part) => part.trim().length > 0);
      relations = {
        suite: {
          data: suiteParts.map((suite) => ({
            title: suite.trim(),
            public_id: null,
          })),
        },
      };
    } else if (scenarioName !== undefined) {
      relations = {
        suite: {
          data: [
            { title: scenarioName, public_id: null },
          ],
        },
      };
    }

    // Merge scenario params with metadata parameters (metadata wins)
    const params: Record<string, string> = { ...scenarioParameters, ...metadata.parameters };

    const hasProjectMapping = Object.keys(metadata.projectMapping).length > 0;

    return {
      attachments,
      author: null,
      execution: {
        status,
        start_time: testCaseStarted.timestamp.seconds,
        end_time: testCaseFinished.timestamp.seconds,
        duration: Math.abs(testCaseFinished.timestamp.seconds - testCaseStarted.timestamp.seconds) * 1000,
        stacktrace: error?.stacktrace ?? null,
        thread: null,
      },
      fields: metadata.fields,
      message: error?.message ?? null,
      muted: false,
      params,
      group_params: metadata.group_params,
      relations,
      run_id: null,
      signature: ResultBuilder.getSignature(pickle, metadata.ids, params),
      steps: [...steps, ...profilerSteps],
      testops_id: hasProjectMapping ? null : (metadata.ids.length > 0 ? metadata.ids : null),
      testops_project_mapping: hasProjectMapping ? metadata.projectMapping : null,
      id: testCaseStarted.id,
      title: metadata.title ?? pickle.name,
      tags: metadata.tags,
    } as unknown as TestResultType;
  }

  static getSignature(pickle: Pickle, ids: number[], parameters: Record<string, string> = {}): string {
    return generateSignature(ids, [...pickle.uri.split('/'), pickle.name], parameters);
  }
}

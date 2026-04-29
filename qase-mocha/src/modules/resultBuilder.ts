import { Suite } from 'mocha';
import { v4 as uuidv4 } from 'uuid';
import {
  TestResultType,
  TestStepType,
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';

import {
  removeQaseIdsFromTitle,
  getFile as getFileFromNode,
  FileSuiteNode,
  normalizeSuitePart,
} from 'qase-javascript-commons/internal';
import { Metadata } from '../types';
import { CapturedOutput } from './outputCapture';

export interface BuildArgs {
  test: Mocha.Test;
  metadata: Metadata;
  steps: TestStepType[];
  profilerSteps: TestStepType[];
  output: CapturedOutput;
  testBeginTime: number;
  cwd: string;
  attachLogs?: boolean;
}

const getFile = (suite: Suite): string | undefined =>
  getFileFromNode(suite as unknown as FileSuiteNode);

export class ResultBuilder {
  static build(args: BuildArgs): TestResultType {
    const { test, metadata, steps, profilerSteps, output, testBeginTime, cwd } = args;
    const end_time = Date.now();
    const duration = test.duration ?? end_time - testBeginTime;

    const fromTitle = parseProjectMappingFromTitle(test.title);

    const ids = ResultBuilder.getQaseId(metadata);
    if (ids.length === 0) {
      ids.push(...fromTitle.legacyIds);
    }
    const hasProjectMapping = Object.keys(fromTitle.projectMapping).length > 0;

    const suites = ResultBuilder.getSuites(test, metadata);
    let relations: Record<string, unknown> = {};
    if (suites.length > 0) {
      relations = {
        suite: {
          data: suites.map((title) => ({ title, public_id: null })),
        },
      };
    }

    let message = metadata.comment ?? '';
    if (test.err?.message) {
      message += message ? `\n\n${test.err.message}` : test.err.message;
    }

    const attachments = [...(metadata.attachments ?? [])];
    if (args.attachLogs) {
      if (output.stdout) {
        attachments.push({
          file_name: 'stdout.txt',
          mime_type: 'text/plain',
          content: output.stdout,
          file_path: null,
          size: 0,
          id: '',
        });
      }
      if (output.stderr) {
        attachments.push({
          file_name: 'stderr.txt',
          mime_type: 'text/plain',
          content: output.stderr,
          file_path: null,
          size: 0,
          id: '',
        });
      }
    }

    return {
      attachments,
      author: null,
      fields: metadata.fields ?? {},
      tags: metadata.tags ?? [],
      message: message ? message : null,
      muted: false,
      params: metadata.parameters ?? {},
      group_params: metadata.groupParameters ?? {},
      relations,
      run_id: null,
      signature: ResultBuilder.getSignature(
        test,
        hasProjectMapping ? [] : ids,
        metadata.parameters ?? {},
        cwd,
      ),
      steps: [...steps, ...profilerSteps],
      id: uuidv4(),
      execution: {
        status: determineTestStatus(test.err ?? null, test.state ?? 'failed'),
        start_time: testBeginTime / 1000,
        end_time: end_time / 1000,
        duration,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: hasProjectMapping ? null : (ids.length > 0 ? ids : null),
      testops_project_mapping: hasProjectMapping ? fromTitle.projectMapping : null,
      title: metadata.title && metadata.title !== ''
        ? metadata.title
        : (fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title)),
    } as unknown as TestResultType;
  }

  static getSignature(
    test: Mocha.Test,
    ids: number[],
    params: Record<string, string>,
    cwd: string,
  ): string {
    const suites: string[] = [];
    const file = test.parent ? getFile(test.parent) : undefined;
    if (file) {
      const executionPath = cwd.endsWith('/') ? cwd : `${cwd}/`;
      const path = file.replace(executionPath, '');
      suites.push(path.split('/').join('::'));
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        suites.push(normalizeSuitePart(suite));
      }
    }

    suites.push(normalizeSuitePart(test.title));

    return generateSignature(ids, suites, params);
  }

  static getQaseId(metadata: Metadata): number[] {
    if (metadata.ids) return [...metadata.ids];
    return [];
  }

  static getSuites(test: Mocha.Test, metadata: Metadata): string[] {
    if (metadata.suite) return [metadata.suite];

    const suites: string[] = [];
    if (test.parent) {
      suites.push(...test.parent.titlePath().filter(Boolean));
    }
    return suites;
  }
}

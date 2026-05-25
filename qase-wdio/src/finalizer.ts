import {
  CompoundError,
  Relation,
  ReporterInterface,
  TestStatusEnum,
  determineTestStatus,
  generateSignature,
  parseProjectMappingFromTitle,
} from 'qase-javascript-commons';
import { removeQaseIdsFromTitle } from 'qase-javascript-commons/internal';
import { Storage } from './storage';
import { CommandTracker } from './command-tracker';
import { IpcBridge } from './ipc';

export class ResultFinalizer {
  constructor(
    private readonly storage: Storage,
    private readonly upstream: ReporterInterface,
    private readonly commandTracker: CommandTracker,
    private readonly ipc: IpcBridge,
  ) {}

  async finalize(
    status: TestStatusEnum,
    err: CompoundError | null,
    endTime: number = Date.now() / 1000,
  ): Promise<void> {
    const testResult = this.storage.getCurrentTest();
    if (testResult === undefined || this.storage.ignore) {
      return;
    }

    if (testResult.relations === null) {
      const relations: Relation = {};
      if (this.storage.suites.length > 0) {
        relations.suite = {
          data: this.storage.suites.map((suite) => ({ title: suite, public_id: null })),
        };
      }
      testResult.relations = relations;
    }

    // start_time/end_time are Unix seconds; duration must be ms per Qase API spec.
    testResult.execution.end_time = endTime;
    testResult.execution.duration = testResult.execution.start_time
      ? Math.round((endTime - testResult.execution.start_time) * 1000)
      : 0;

    let error: Error | null = null;
    if (err) {
      error = new Error(err.message || 'Test failed');
      if (err.stacktrace) {
        error.stack = err.stacktrace;
      }
    }
    testResult.execution.status = determineTestStatus(error, status);

    testResult.execution.stacktrace = err === null
      ? null
      : err.stacktrace === undefined
        ? null
        : err.stacktrace;

    const errorMessage = err === null
      ? null
      : err.message === undefined
        ? null
        : err.message;

    if (this.storage.comment) {
      testResult.message = errorMessage
        ? `${this.storage.comment}\n\n${errorMessage}`
        : this.storage.comment;
    } else {
      testResult.message = errorMessage;
    }

    testResult.signature = generateSignature(
      Array.isArray(testResult.testops_id)
        ? testResult.testops_id
        : testResult.testops_id
          ? [testResult.testops_id]
          : null,
      [...this.storage.suites, testResult.title],
      testResult.params,
    );

    const parsed = parseProjectMappingFromTitle(testResult.title);
    const hasProjectMapping = Object.keys(parsed.projectMapping).length > 0;
    if (hasProjectMapping) {
      testResult.testops_project_mapping = parsed.projectMapping;
      testResult.testops_id = null;
    } else if (parsed.legacyIds.length > 0) {
      testResult.testops_id = parsed.legacyIds.length === 1 ? parsed.legacyIds[0]! : parsed.legacyIds;
    }
    testResult.title = parsed.cleanedTitle || removeQaseIdsFromTitle(testResult.title);

    const inProcessSteps = this.commandTracker.drainNewProfilerSteps();
    if (inProcessSteps.length > 0) {
      testResult.steps = [...testResult.steps, ...inProcessSteps];
    }

    const ipcSteps = this.ipc.drainProfilerSteps();
    if (ipcSteps.length > 0) {
      testResult.steps = [...testResult.steps, ...ipcSteps];
    }

    await this.upstream.addTestResult(testResult);
  }
}

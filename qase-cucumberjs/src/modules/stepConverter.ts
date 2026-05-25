import { PickleStep, TestStepFinished, TestStepStarted, Timestamp } from '@cucumber/messages';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { Attachment, StepType, TestStepType } from 'qase-javascript-commons';
import { STEP_STATUS_MAP } from './statusMaps';

export class StepConverter {
  static convert(
    pickleSteps: readonly PickleStep[],
    testCase: TestCase,
    startedSteps: Map<string, TestStepStarted>,
    finishedSteps: Map<string, TestStepFinished>,
    getAttachments: (stepId: string) => Attachment[],
  ): TestStepType[] {
    const results: TestStepType[] = [];

    for (const s of testCase.testSteps) {
      const finished = finishedSteps.get(s.id);
      if (!finished) continue;

      const step = pickleSteps.find((ps) => ps.id === s.pickleStepId);
      if (!step) continue;

      const started = startedSteps.get(s.id);
      const startTimeSec = started ? StepConverter.toSeconds(started.timestamp) : null;
      const endTimeSec = StepConverter.toSeconds(finished.timestamp);

      results.push({
        id: s.id,
        step_type: StepType.GHERKIN,
        data: {
          keyword: step.text,
          name: step.text,
          line: 0,
        },
        execution: {
          status: STEP_STATUS_MAP[finished.testStepResult.status],
          start_time: startTimeSec,
          end_time: endTimeSec,
          duration: finished.testStepResult.duration.seconds * 1000
            + Math.round(finished.testStepResult.duration.nanos / 1e6),
        },
        attachments: getAttachments(s.id),
        steps: [],
        parent_id: null,
      } as TestStepType);
    }

    return results;
  }

  /**
   * Cucumber `Timestamp` is `{ seconds, nanos }`. Convert to a Unix-seconds
   * number with fractional milliseconds.
   */
  private static toSeconds(ts: Timestamp): number {
    return ts.seconds + ts.nanos / 1e9;
  }
}

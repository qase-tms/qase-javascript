import { TestStepType } from 'qase-javascript-commons';
import { events } from './events';
import { MetadataApplier } from './metadata';
import {
  AddAttachmentEventArgs,
  AddCommentEventArgs,
  AddQaseIdEventArgs,
  AddRecordsEventArgs,
  AddSuiteEventArgs,
  AddTagsEventArgs,
  AddTitleEventArgs,
} from './models';

export class IpcBridge {
  private pendingProfilerSteps: TestStepType[] = [];

  constructor(private readonly metadata: MetadataApplier) {}

  registerListeners(): void {
    process.on(events.addQaseID, (args: AddQaseIdEventArgs) => this.metadata.addQaseId(args));
    process.on(events.addTitle, (args: AddTitleEventArgs) => this.metadata.addTitle(args));
    process.on(events.addFields, (args: AddRecordsEventArgs) => this.metadata.addFields(args));
    process.on(events.addSuite, (args: AddSuiteEventArgs) => this.metadata.addSuite(args));
    process.on(events.addParameters, (args: AddRecordsEventArgs) => this.metadata.addParameters(args));
    process.on(events.addGroupParameters, (args: AddRecordsEventArgs) => this.metadata.addGroupParameters(args));
    process.on(events.addComment, (args: AddCommentEventArgs) => this.metadata.addComment(args));
    process.on(events.addAttachment, (args: AddAttachmentEventArgs) => this.metadata.addAttachment(args));
    process.on(events.addIgnore, () => this.metadata.ignore());
    process.on(events.addStep, (step: TestStepType) => this.metadata.addStep(step));
    process.on(events.addTags, (args: AddTagsEventArgs) => this.metadata.addTags(args));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.on(events.addProfilerSteps as any, (data: string) => {
      try {
        const steps = JSON.parse(data) as TestStepType[];
        this.pendingProfilerSteps.push(...steps);
      } catch {
        // Corrupted profiler data must not affect test results.
      }
    });
  }

  drainProfilerSteps(): TestStepType[] {
    const drained = this.pendingProfilerSteps;
    this.pendingProfilerSteps = [];
    return drained;
  }
}

import { TestCase, TestStep } from '@playwright/test/reporter';
import { Attachment } from 'qase-javascript-commons';

/**
 * Per-instance shared state for step caching (used by `onStepBegin` and
 * `MetadataExtractor`) and per-step attachment routing (populated by
 * `MetadataExtractor`, consumed by `StepConverter`).
 */
export class StepIndex {
  private readonly stepCache = new Map<TestStep, TestCase>();
  private readonly stepAttachments = new Map<TestStep, Attachment[]>();

  cacheStep(step: TestStep, test: TestCase): void {
    this.stepCache.set(step, test);
  }

  hasStepCached(step: TestStep): boolean {
    return this.stepCache.has(step);
  }

  findStepByTitle(title: string): TestStep | undefined {
    for (const step of this.stepCache.keys()) {
      if (step.title === title) {
        return step;
      }
    }
    return undefined;
  }

  removeStep(step: TestStep): void {
    this.stepCache.delete(step);
  }

  addAttachmentToStep(parent: TestStep, attachment: Attachment): void {
    const existing = this.stepAttachments.get(parent);
    if (existing) {
      existing.push(attachment);
    } else {
      this.stepAttachments.set(parent, [attachment]);
    }
  }

  getStepAttachments(step: TestStep): Attachment[] | undefined {
    return this.stepAttachments.get(step);
  }
}

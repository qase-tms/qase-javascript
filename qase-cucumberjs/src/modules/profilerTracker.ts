import { TestStepType } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

export class ProfilerTracker {
  private snapshots: Record<string, number> = {};

  constructor(private readonly profiler: NetworkProfiler | null) {}

  onTestStart(testCaseStartedId: string): void {
    if (this.profiler) {
      this.snapshots[testCaseStartedId] = this.profiler.getAllSteps().length;
    }
  }

  getEvents(testCaseStartedId: string): TestStepType[] {
    if (!this.profiler) return [];
    const snapshot = this.snapshots[testCaseStartedId] ?? 0;
    return this.profiler.getAllSteps().slice(snapshot);
  }

  reset(testCaseStartedId: string): void {
    delete this.snapshots[testCaseStartedId];
  }

  restore(): void {
    this.profiler?.restore();
  }
}

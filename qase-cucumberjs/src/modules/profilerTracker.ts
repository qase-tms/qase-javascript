import { TestStepType } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

export class ProfilerTracker {
  private readonly snapshots = new Map<string, number>();

  constructor(private readonly profiler: NetworkProfiler | null) {}

  onTestStart(testCaseStartedId: string): void {
    if (this.profiler) {
      this.snapshots.set(testCaseStartedId, this.profiler.getAllSteps().length);
    }
  }

  getEvents(testCaseStartedId: string): TestStepType[] {
    if (!this.profiler) return [];
    const snapshot = this.snapshots.get(testCaseStartedId) ?? 0;
    return this.profiler.getAllSteps().slice(snapshot);
  }

  reset(testCaseStartedId: string): void {
    this.snapshots.delete(testCaseStartedId);
  }

  restore(): void {
    this.profiler?.restore();
  }
}

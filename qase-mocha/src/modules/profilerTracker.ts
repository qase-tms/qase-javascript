import { TestStepType } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

export class ProfilerTracker {
  private snapshot = 0;

  constructor(private readonly profiler: NetworkProfiler | null) {}

  onTestStart(): void {
    this.snapshot = this.profiler?.getAllSteps().length ?? 0;
  }

  getEvents(): TestStepType[] {
    if (!this.profiler) return [];
    const all = this.profiler.getAllSteps();
    return all.slice(this.snapshot);
  }

  reset(): void {
    this.snapshot = 0;
  }

  restore(): void {
    this.profiler?.restore();
  }
}

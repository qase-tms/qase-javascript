import { TestStepType } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

export class ProfilerTracker {
  private profiler: NetworkProfiler | null;
  private snapshot = 0;

  constructor(profiler: NetworkProfiler | null) {
    this.profiler = profiler;
  }

  enable(): void {
    this.profiler?.enable();
  }

  restore(): void {
    this.profiler?.restore();
  }

  getNewSteps(): TestStepType[] {
    if (!this.profiler) return [];
    const all = this.profiler.getAllSteps();
    const fresh = all.slice(this.snapshot);
    this.snapshot = all.length;
    return fresh;
  }
}

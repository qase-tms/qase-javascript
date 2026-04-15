import { InternalReporterInterface } from '../abstract-reporter';
import { LoggerInterface } from '../../utils/logger';

export interface FallbackCoordinatorCallbacks {
  onUpstreamFailure?: () => void;
  onFallbackFailure?: () => void;
  onFallbackActivated?: () => void;
  onDisabled?: () => void;
}

/**
 * Encapsulates the upstream → fallback → disabled cascade used across all
 * `QaseReporter` lifecycle methods. Keeps both reporters' state (useFallback
 * / disabled) in one place instead of spreading try/catch blocks everywhere.
 */
export class FallbackCoordinator {
  private useFallback = false;
  private disabled = false;
  private onDisabledFired = false;

  constructor(
    private readonly logger: LoggerInterface,
    private readonly upstream: InternalReporterInterface | undefined,
    private readonly fallback: InternalReporterInterface | undefined,
    private readonly callbacks: FallbackCoordinatorCallbacks = {},
  ) {}

  isDisabled(): boolean {
    return this.disabled;
  }

  isUsingFallback(): boolean {
    return this.useFallback;
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  setUseFallback(value: boolean): void {
    this.useFallback = value;
  }

  getUpstream(): InternalReporterInterface | undefined {
    return this.upstream;
  }

  getFallback(): InternalReporterInterface | undefined {
    return this.fallback;
  }

  /**
   * Clear the disabled / useFallback flags so the coordinator can be reused
   * for a fresh test run. Does not re-arm the `onDisabled` callback — it
   * only fires once per coordinator lifetime regardless of resets.
   */
  reset(): void {
    this.disabled = false;
    this.useFallback = false;
  }

  /**
   * Run `op` on the currently active reporter. On upstream failure, switch to
   * the fallback (copying accumulated results over once) and retry. On
   * fallback failure, disable the coordinator.
   *
   * Returns the operation's result, or `undefined` if the coordinator is
   * disabled or the operation produced no value.
   */
  async run<T>(
    op: (reporter: InternalReporterInterface) => Promise<T>,
    opName: string,
  ): Promise<T | undefined> {
    if (this.disabled) return undefined;

    if (this.useFallback) {
      return this.runOnFallback(op, opName);
    }

    if (!this.upstream) {
      // No upstream configured — route directly to fallback without
      // copying results (there are none to copy).
      if (!this.fallback) return undefined;
      this.useFallback = true;
      return this.runOnFallback(op, opName);
    }

    try {
      return await op(this.upstream);
    } catch (error) {
      this.logger.logError(`Unable to ${opName} in the upstream reporter:`, error);
      this.callbacks.onUpstreamFailure?.();

      if (!this.fallback) {
        this.disable();
        return undefined;
      }

      this.activateFallback();
      return this.runOnFallback(op, opName);
    }
  }

  private disable(): void {
    if (this.disabled) return;
    this.disabled = true;
    if (!this.onDisabledFired) {
      this.onDisabledFired = true;
      this.callbacks.onDisabled?.();
    }
  }

  private activateFallback(): void {
    if (this.useFallback) return;
    const results = this.upstream?.getTestResults() ?? [];
    this.fallback?.setTestResults(results);
    this.useFallback = true;
    this.callbacks.onFallbackActivated?.();
  }

  private async runOnFallback<T>(
    op: (reporter: InternalReporterInterface) => Promise<T>,
    opName: string,
  ): Promise<T | undefined> {
    if (!this.fallback) {
      this.disable();
      return undefined;
    }
    try {
      return await op(this.fallback);
    } catch (error) {
      this.logger.logError(`Unable to ${opName} in the fallback reporter:`, error);
      this.callbacks.onFallbackFailure?.();
      this.disable();
      return undefined;
    }
  }
}

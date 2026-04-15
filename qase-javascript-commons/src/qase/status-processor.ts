import { TestResultType } from '../models';
import { LoggerInterface } from '../utils/logger';
import { applyStatusMapping } from '../utils/status-mapping-utils';

/**
 * Applies status mapping (rename rule) and status filter (drop rule) to a test
 * result. Mutates `result.execution.status` when a mapping rule matches, then
 * returns either the (possibly mutated) result or `null` if it should be
 * filtered out.
 */
export class StatusProcessor {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly statusMapping: Record<string, string> | undefined,
    private readonly statusFilter: string[] | undefined,
  ) {}

  process(result: TestResultType): TestResultType | null {
    this.applyMapping(result);
    if (this.shouldFilter(result)) {
      this.logger.logDebug(
        `Filtering out test result with status: ${result.execution.status}`,
      );
      return null;
    }
    return result;
  }

  private applyMapping(result: TestResultType): void {
    if (!this.statusMapping) return;
    const originalStatus = result.execution.status;
    const mapped = applyStatusMapping(originalStatus, this.statusMapping);
    if (mapped !== originalStatus) {
      this.logger.logDebug(
        `Status mapping applied: ${originalStatus} -> ${mapped}`,
      );
      result.execution.status = mapped;
    }
  }

  private shouldFilter(result: TestResultType): boolean {
    if (!this.statusFilter || this.statusFilter.length === 0) return false;
    const statusString = result.execution.status.toString();
    this.logger.logDebug(
      `Checking filter: status="${statusString}", filter=${JSON.stringify(this.statusFilter)}`,
    );
    const shouldFilter = this.statusFilter.includes(statusString);
    this.logger.logDebug(
      `Filter result: ${shouldFilter ? 'FILTERED' : 'NOT FILTERED'}`,
    );
    return shouldFilter;
  }
}

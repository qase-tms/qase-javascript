import type { Test } from 'mocha';
import {
  getFile as getFileFromNode,
  FileSuiteNode,
} from 'qase-javascript-commons/internal';

const getFile = (suite: { parent?: unknown; file?: string }): string | undefined =>
  getFileFromNode(suite as unknown as FileSuiteNode);

/**
 * Tracks which tests the reporter has already produced a result for.
 * Used to detect tests skipped due to a `beforeEach` failure (those never
 * fire a `TEST_PASS`/`PENDING`/`FAIL` event).
 */
export class TestTracker {
  private readonly processed = new Set<string>();

  getTestIdentifier(test: Test): string {
    const file = test.parent ? getFile(test.parent) ?? '' : '';
    const suitePath = test.parent ? test.parent.titlePath().join(' > ') : '';
    let testTitle = test.fullTitle();
    testTitle = testTitle.replace(/"before each" hook for "/g, '');
    if (testTitle.endsWith('"')) {
      testTitle = testTitle.slice(0, -1);
    }
    return `${file}::${suitePath}::${testTitle}`;
  }

  markProcessed(test: Test): void {
    this.processed.add(this.getTestIdentifier(test));
  }

  isProcessed(test: Test): boolean {
    return this.processed.has(this.getTestIdentifier(test));
  }
}

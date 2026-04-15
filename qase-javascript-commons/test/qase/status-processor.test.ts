/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/require-await */
import { expect } from '@jest/globals';
import { StatusProcessor } from '../../src/qase/status-processor';
import { TestResultType, TestStatusEnum } from '../../src/models';
import { LoggerInterface } from '../../src/utils/logger';

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

const makeResult = (status: TestStatusEnum): TestResultType =>
  ({
    id: 'r1',
    title: 'test',
    execution: { status, duration: 10 } as any,
  }) as unknown as TestResultType;

describe('StatusProcessor', () => {
  describe('status mapping', () => {
    it('leaves status untouched when no mapping is provided', () => {
      const p = new StatusProcessor(silentLogger(), undefined, undefined);
      const r = makeResult(TestStatusEnum.passed);
      const out = p.process(r);
      expect(out).toBe(r);
      expect(r.execution.status).toBe(TestStatusEnum.passed);
    });

    it('applies mapping rule to matching status', () => {
      const p = new StatusProcessor(
        silentLogger(),
        { passed: TestStatusEnum.blocked },
        undefined,
      );
      const r = makeResult(TestStatusEnum.passed);
      p.process(r);
      expect(r.execution.status).toBe(TestStatusEnum.blocked);
    });

    it('leaves status untouched when rule does not match', () => {
      const p = new StatusProcessor(
        silentLogger(),
        { failed: TestStatusEnum.skipped },
        undefined,
      );
      const r = makeResult(TestStatusEnum.passed);
      p.process(r);
      expect(r.execution.status).toBe(TestStatusEnum.passed);
    });
  });

  describe('status filter', () => {
    it('returns the result when filter is empty', () => {
      const p = new StatusProcessor(silentLogger(), undefined, []);
      const r = makeResult(TestStatusEnum.skipped);
      expect(p.process(r)).toBe(r);
    });

    it('returns null when status is in the filter list', () => {
      const p = new StatusProcessor(silentLogger(), undefined, ['skipped']);
      const r = makeResult(TestStatusEnum.skipped);
      expect(p.process(r)).toBeNull();
    });

    it('returns the result when status is not in the filter list', () => {
      const p = new StatusProcessor(silentLogger(), undefined, ['skipped']);
      const r = makeResult(TestStatusEnum.passed);
      expect(p.process(r)).toBe(r);
    });
  });

  describe('combined', () => {
    it('filters by post-mapping status', () => {
      const p = new StatusProcessor(
        silentLogger(),
        { passed: TestStatusEnum.skipped },
        ['skipped'],
      );
      const r = makeResult(TestStatusEnum.passed);
      expect(p.process(r)).toBeNull();
    });
  });
});

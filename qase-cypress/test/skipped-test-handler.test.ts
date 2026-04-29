/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import type { Suite, Test } from 'mocha';
import { TestStatusEnum, TestResultType } from 'qase-javascript-commons';
import { SkippedTestHandler } from '../src/skipped-test-handler';
import { TestTracker } from '../src/test-tracker';
import { ResultBuilder } from '../src/result-builder';
import { StepConverter } from '../src/step-converter';

function makeTest(title: string): Test {
  return {
    title,
    fullTitle: () => title,
    parent: undefined,
  } as unknown as Test;
}

function makeSuite(tests: Test[], nested: Suite[] = []): Suite {
  return { tests, suites: nested } as unknown as Suite;
}

function makeFakeResult(title: string): TestResultType {
  return { title, execution: { status: TestStatusEnum.skipped } } as unknown as TestResultType;
}

describe('SkippedTestHandler', () => {
  let tracker: TestTracker;
  let resultBuilder: ResultBuilder;
  let publish: jest.Mock<(r: TestResultType) => void>;
  let handler: SkippedTestHandler;

  beforeEach(() => {
    tracker = new TestTracker();
    resultBuilder = new ResultBuilder(new StepConverter());
    publish = jest.fn() as any;
    handler = new SkippedTestHandler(
      tracker,
      resultBuilder,
      publish,
      () => ({ screenshotsFolder: undefined, testBeginTime: 1000 }),
    );
  });

  it('does nothing for an empty suite', () => {
    handler.handleSuiteEnd(makeSuite([]));
    expect(publish).not.toHaveBeenCalled();
  });

  it('does not publish anything when every test is already processed', () => {
    const t1 = makeTest('a');
    const t2 = makeTest('b');
    tracker.markProcessed(t1);
    tracker.markProcessed(t2);
    handler.handleSuiteEnd(makeSuite([t1, t2]));
    expect(publish).not.toHaveBeenCalled();
  });

  it('publishes a skipped result for each unprocessed test', () => {
    jest.spyOn(resultBuilder, 'buildSkipped').mockImplementation(({ test }) => makeFakeResult(test.title));
    const t1 = makeTest('a');
    const t2 = makeTest('b');
    tracker.markProcessed(t1); // t1 already done; t2 should be marked skipped
    handler.handleSuiteEnd(makeSuite([t1, t2]));
    expect(publish).toHaveBeenCalledTimes(1);
    expect((publish.mock.calls[0]![0] as any).title).toBe('b');
  });

  it('marks the test as processed after publishing the skipped result', () => {
    jest.spyOn(resultBuilder, 'buildSkipped').mockImplementation(({ test }) => makeFakeResult(test.title));
    const t = makeTest('only');
    handler.handleSuiteEnd(makeSuite([t]));
    expect(tracker.isProcessed(t)).toBe(true);
  });

  it('walks nested suites recursively', () => {
    jest.spyOn(resultBuilder, 'buildSkipped').mockImplementation(({ test }) => makeFakeResult(test.title));
    const inner1 = makeTest('x');
    const inner2 = makeTest('y');
    const inner = makeSuite([inner1]);
    const middle = makeSuite([inner2], [inner]);
    handler.handleSuiteEnd(middle);
    expect(publish).toHaveBeenCalledTimes(2);
  });

  it('uses the buildArgsFor factory to obtain screenshotsFolder/testBeginTime per test', () => {
    const factory = jest.fn(() => ({ screenshotsFolder: '/s', testBeginTime: 42 }));
    const h = new SkippedTestHandler(tracker, resultBuilder, publish, factory as any);
    jest.spyOn(resultBuilder, 'buildSkipped').mockImplementation(({ test }) => makeFakeResult(test.title));
    h.handleSuiteEnd(makeSuite([makeTest('a')]));
    expect(factory).toHaveBeenCalled();
  });

  it('does not double-publish if the same test exists in multiple suites', () => {
    jest.spyOn(resultBuilder, 'buildSkipped').mockImplementation(({ test }) => makeFakeResult(test.title));
    const t = makeTest('shared');
    const inner = makeSuite([t]);
    const outer = makeSuite([t], [inner]);
    handler.handleSuiteEnd(outer);
    expect(publish).toHaveBeenCalledTimes(1);
  });
});

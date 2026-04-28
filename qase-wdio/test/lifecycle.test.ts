/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import {
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { Storage } from '../src/storage';
import { TestLifecycle } from '../src/lifecycle';

describe('TestLifecycle', () => {
  let storage: Storage;
  let lifecycle: TestLifecycle;

  beforeEach(() => {
    storage = new Storage();
    lifecycle = new TestLifecycle(storage);
  });

  describe('startTest', () => {
    it('pushes a TestResultType with a uuid id and the supplied thread', () => {
      lifecycle.startTest('login flow', 'cid-1', 1700000000);
      const test = storage.getCurrentTest();
      expect(test).toBeInstanceOf(TestResultType);
      expect(test?.title).toBe('login flow');
      expect(test?.execution.thread).toBe('cid-1');
      expect(test?.execution.start_time).toBe(1700000000);
      expect(typeof test?.id).toBe('string');
      expect(test?.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('defaults start_time to now (in seconds) when not supplied', () => {
      const before = Date.now() / 1000;
      lifecycle.startTest('t', 'cid');
      const after = Date.now() / 1000;
      expect(storage.getCurrentTest()?.execution.start_time).toBeGreaterThanOrEqual(before - 1);
      expect(storage.getCurrentTest()?.execution.start_time).toBeLessThanOrEqual(after + 1);
    });
  });

  describe('startStep', () => {
    it('does not throw when no item is on the stack and still records the step in the storage stack', () => {
      lifecycle.startStep('step-without-parent');
      const step = storage.getCurrentStep();
      expect(step).toBeDefined();
      expect(step?.data.action).toBe('step-without-parent');
    });

    it('pushes a step under the current test and into the stack', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.startStep('click button');
      const test = storage.getCurrentTest()!;
      expect(test.steps).toHaveLength(1);
      expect(test.steps[0]?.data.action).toBe('click button');
      expect(test.steps[0]?.parent_id).toBe(test.id);
      expect(test.steps[0]?.execution.status).toBe(StepStatusEnum.passed);
      expect(storage.getCurrentStep()).toBe(test.steps[0]);
    });

    it('nests a child step under the parent step', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.startStep('outer');
      const outer = storage.getCurrentStep()!;
      lifecycle.startStep('inner');
      const inner = storage.getCurrentStep()!;
      expect(inner.parent_id).toBe(outer.id);
    });
  });

  describe('endStep', () => {
    it('pops the top step and marks it passed by default', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.startStep('s');
      const before = Date.now() / 1000;
      lifecycle.endStep();
      const after = Date.now() / 1000;
      const test = storage.getCurrentTest()!;
      expect(test.steps[0]?.execution.status).toBe(StepStatusEnum.passed);
      expect(test.steps[0]?.execution.end_time).toBeGreaterThanOrEqual(before - 1);
      expect(test.steps[0]?.execution.end_time).toBeLessThanOrEqual(after + 1);
      expect(storage.getCurrentStep()).toBeUndefined();
    });

    it('records the supplied status', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.startStep('s');
      lifecycle.endStep(TestStatusEnum.failed);
      const test = storage.getCurrentTest()!;
      expect(test.steps[0]?.execution.status).toBe(TestStatusEnum.failed);
    });

    it('is a no-op when stack is empty', () => {
      expect(() => lifecycle.endStep()).not.toThrow();
    });
  });

  describe('attachFile', () => {
    it('throws when there is no active item', () => {
      expect(() => lifecycle.attachFile('a.txt', 'x', 'text/plain')).toThrow(
        "There isn't any active test!",
      );
    });

    it('attaches to the last item on the stack', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.attachFile('a.txt', 'hello', 'text/plain');
      const test = storage.getCurrentTest()!;
      expect(test.attachments).toHaveLength(1);
      expect(test.attachments[0]?.file_name).toBe('a.txt');
      expect(test.attachments[0]?.mime_type).toBe('text/plain');
      expect(test.attachments[0]?.content).toBe('hello');
      expect(test.attachments[0]?.size).toBe(5);
    });
  });

  describe('attachJSON', () => {
    it('serializes objects with 2-space indent and labels them text/plain', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.attachJSON('payload', { a: 1 });
      const test = storage.getCurrentTest()!;
      expect(test.attachments[0]?.content).toBe('{\n  "a": 1\n}');
      expect(test.attachments[0]?.mime_type).toBe('text/plain');
    });

    it('passes through strings as application/json', () => {
      lifecycle.startTest('t', 'cid');
      lifecycle.attachJSON('payload', '{"already":"json"}');
      const test = storage.getCurrentTest()!;
      expect(test.attachments[0]?.content).toBe('{"already":"json"}');
      expect(test.attachments[0]?.mime_type).toBe('application/json');
    });
  });
});

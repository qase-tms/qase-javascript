import { afterEach, describe, expect, it } from '@jest/globals';
import { RunFailures } from '../../src/state/run-failures';

describe('RunFailures', () => {
  afterEach(() => {
    RunFailures.consume();
    Reflect.deleteProperty(process.env, 'QASE_RUN_SESSION');
  });

  it('records nothing outside a run', () => {
    RunFailures.record();
    expect(RunFailures.consume()).toBe(false);
  });

  it('keeps the session a parent process started', () => {
    process.env['QASE_RUN_SESSION'] = 'parent';
    RunFailures.begin();
    expect(process.env['QASE_RUN_SESSION']).toBe('parent');
  });

  it('reports a failure recorded during the run once', () => {
    RunFailures.begin();
    RunFailures.record();
    expect(RunFailures.consume()).toBe(true);
    expect(RunFailures.consume()).toBe(false);
  });
});

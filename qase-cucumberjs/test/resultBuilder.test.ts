/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { Pickle, TestCase, TestCaseFinished, TestCaseStarted } from '@cucumber/messages';
import { TestStatusEnum } from 'qase-javascript-commons';
import { TestMetadata } from '../src/models';
import { ResultBuilder } from '../src/modules/resultBuilder';

const baseMetadata: TestMetadata = {
  ids: [],
  projectMapping: {},
  fields: {},
  title: null,
  isIgnore: false,
  parameters: {},
  group_params: {},
  suite: null,
  tags: [],
};

function makeArgs(overrides: any = {}) {
  const pickle = { id: 'p1', name: 'A scenario', tags: [], steps: [], astNodeIds: ['scenario-1'], uri: 'features/x.feature', language: 'en' } as unknown as Pickle;
  const tcs = { id: 'tcs1', testCaseId: 'tc1', timestamp: { seconds: 100, nanos: 0 } } as unknown as TestCaseStarted;
  const tc = { id: 'tc1', pickleId: 'p1', testSteps: [] } as unknown as TestCase;
  const tcf = { testCaseStartedId: 'tcs1', timestamp: { seconds: 110, nanos: 0 } } as unknown as TestCaseFinished;
  return {
    testCaseFinished: tcf,
    testCaseStarted: tcs,
    testCase: tc,
    pickle,
    metadata: { ...baseMetadata },
    status: TestStatusEnum.passed,
    error: undefined,
    steps: [],
    profilerSteps: [],
    attachments: [],
    scenarioName: 'Feature A',
    scenarioParameters: {},
    ...overrides,
  };
}

describe('ResultBuilder', () => {
  it('builds a passed result with default metadata', () => {
    const result = ResultBuilder.build(makeArgs());
    expect(result.execution.status).toBe(TestStatusEnum.passed);
    expect(result.title).toBe('A scenario');
    expect(result.testops_id).toBeNull();
  });

  it('uses metadata.title override', () => {
    const result = ResultBuilder.build(makeArgs({
      metadata: { ...baseMetadata, title: 'Override Title' },
    }));
    expect(result.title).toBe('Override Title');
  });

  it('uses metadata.suite override (tab-separated for sub-suites)', () => {
    const result = ResultBuilder.build(makeArgs({
      metadata: { ...baseMetadata, suite: 'Outer\tInner' },
    }));
    const data = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(data).toEqual(['Outer', 'Inner']);
  });

  it('falls back to scenarioName when metadata.suite missing', () => {
    const result = ResultBuilder.build(makeArgs({ scenarioName: 'My Feature' }));
    const data = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(data).toEqual(['My Feature']);
  });

  it('merges scenario parameters with metadata.parameters (metadata wins)', () => {
    const result = ResultBuilder.build(makeArgs({
      metadata: { ...baseMetadata, parameters: { region: 'override' } },
      scenarioParameters: { region: 'gherkin', env: 'prod' },
    }));
    expect(result.params).toEqual({ region: 'override', env: 'prod' });
  });

  it('respects project mapping precedence (testops_id null when projectMapping non-empty)', () => {
    const result = ResultBuilder.build(makeArgs({
      metadata: { ...baseMetadata, ids: [42], projectMapping: { PROJ: [10] } },
    }));
    expect(result.testops_id).toBeNull();
    expect(result.testops_project_mapping).toEqual({ PROJ: [10] });
  });
});

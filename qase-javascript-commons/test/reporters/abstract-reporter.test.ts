import { expect } from '@jest/globals';
import { AbstractReporter } from '../../src/reporters/abstract-reporter';
import { Attachment, TestResultType, TestStatusEnum } from '../../src/models';
import { LoggerInterface } from '../../src/utils/logger';

/** Minimal concrete reporter: only the accumulation logic of the base class is under test. */
class CollectingReporter extends AbstractReporter {
  constructor(logger: LoggerInterface) {
    super(logger);
  }

  public async publish(): Promise<void> {
    return Promise.resolve();
  }

  public async startTestRun(): Promise<void> {
    return Promise.resolve();
  }

  public async sendResults(): Promise<void> {
    return Promise.resolve();
  }

  public async complete(): Promise<void> {
    return Promise.resolve();
  }

  public async uploadAttachment(_attachment: Attachment): Promise<string> {
    return Promise.resolve('');
  }

  public peek(): TestResultType[] {
    return this.results;
  }
}

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

function makeResult(overrides: Partial<TestResultType> = {}): TestResultType {
  return {
    id: '',
    title: 'Test case',
    signature: 'sig',
    run_id: null,
    testops_id: 1,
    testops_project_mapping: null,
    execution: {
      status: TestStatusEnum.passed,
      start_time: 1000,
      end_time: 2000,
      duration: 1000,
      stacktrace: null,
      thread: null,
    },
    fields: {},
    attachments: [],
    steps: [],
    params: {},
    group_params: {},
    author: null,
    relations: null,
    muted: false,
    message: null,
    tags: [],
    ...overrides,
  } as unknown as TestResultType;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('AbstractReporter result ids', () => {
  let reporter: CollectingReporter;

  beforeEach(() => {
    reporter = new CollectingReporter(silentLogger());
  });

  it('fills in a missing id, so the idempotency key is never empty', async () => {
    await reporter.addTestResult(makeResult({ id: '' }));

    const [result] = reporter.peek();
    expect(result?.id).toMatch(UUID_RE);
  });

  it('keeps an id the framework already provided', async () => {
    await reporter.addTestResult(makeResult({ id: 'framework-id' }));

    expect(reporter.peek()[0]?.id).toBe('framework-id');
  });

  it('replaces a reused id so two results cannot collapse into one', async () => {
    // Newman replays the same Postman item id on every iteration.
    await reporter.addTestResult(makeResult({ id: 'item-42', title: 'iteration 1' }));
    await reporter.addTestResult(makeResult({ id: 'item-42', title: 'iteration 2' }));

    const [first, second] = reporter.peek();
    expect(first?.id).toBe('item-42');
    expect(second?.id).toMatch(UUID_RE);
    expect(second?.id).not.toBe(first?.id);
  });

  it('gives every result a distinct id across a whole run', async () => {
    for (let i = 0; i < 25; i++) {
      await reporter.addTestResult(makeResult({ id: i % 2 === 0 ? '' : 'shared' }));
    }

    const ids = reporter.peek().map((result) => result.id);
    expect(new Set(ids).size).toBe(25);
  });

  it('gives each copy of a multi-id result its own id', async () => {
    await reporter.addTestResult(makeResult({ testops_id: [1, 2, 3], id: '' }));

    const ids = reporter.peek().map((result) => result.id);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    ids.forEach((id) => expect(id).toMatch(UUID_RE));
  });

  it('fills in missing ids on results set from another process', () => {
    const provided = makeResult({ id: 'from-cypress' });
    const missing = makeResult({ id: '' });

    reporter.setTestResults([provided, missing]);

    expect(provided.id).toBe('from-cypress');
    expect(missing.id).toMatch(UUID_RE);
  });

  it('does not rewrite ids handed over by setTestResults, even duplicated ones', () => {
    // Rewriting here would change the idempotency key of a result that may already
    // have reached Qase from the other process.
    const first = makeResult({ id: 'same' });
    const second = makeResult({ id: 'same' });

    reporter.setTestResults([first, second]);

    expect(first.id).toBe('same');
    expect(second.id).toBe('same');
  });

  it('does not reuse an id taken by setTestResults for a later addTestResult', async () => {
    reporter.setTestResults([makeResult({ id: 'taken' })]);

    await reporter.addTestResult(makeResult({ id: 'taken' }));

    const ids = reporter.peek().map((result) => result.id);
    expect(new Set(ids).size).toBe(2);
  });
});

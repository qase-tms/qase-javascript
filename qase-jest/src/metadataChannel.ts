import { createHash } from 'crypto';
import { mkdtempSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Attachment, TestStepType } from 'qase-javascript-commons';
import { Metadata } from './models';
import { MetadataApplier } from './modules/metadataApplier';

/**
 * Tests run in Jest worker processes while the reporter runs in the main one, so `qase.*`
 * calls cannot reach the reporter in memory. Each test's metadata is written to a file in a
 * directory the reporter creates, and the reporter reads it when the test's result arrives.
 * Workers are forked after reporters are constructed, so they inherit this variable.
 */
export const METADATA_DIR_ENV = 'QASE_JEST_METADATA_DIR';

// Each retry of a test is reported as its own result, so the attempt is part of the key.
const metadataFile = (dir: string, test: CurrentTest): string => {
  const key = `${test.testPath}\0${test.testName}\0${test.invocation}`;
  return join(dir, `${createHash('sha1').update(key).digest('hex')}.json`);
};

export interface CurrentTest {
  testPath: string;
  testName: string;
  invocation: number;
}

interface ExpectState {
  testPath?: string;
  currentTestName?: string;
  currentConcurrentTestName?: () => string | undefined;
}

interface ExpectWithState {
  getState(): ExpectState;
}

interface CircusTest {
  status?: string;
  invocations?: number;
}

/**
 * The test jest-circus is running, `null` between tests, or `undefined` when its state cannot
 * be found. It is stored under a non-registered symbol, so it is looked up by description.
 */
const circusRunningTest = (): CircusTest | null | undefined => {
  const sym = Object.getOwnPropertySymbols(globalThis).find(
    (s) => s.description === 'JEST_STATE_SYMBOL',
  );
  if (!sym) return undefined;
  const state = (globalThis as unknown as Record<symbol, { currentlyRunningTest?: CircusTest | null } | undefined>)[sym];
  return state?.currentlyRunningTest ?? null;
};

const currentTest = (): CurrentTest | null => {
  const state = (globalThis as { expect?: ExpectWithState }).expect?.getState();
  if (!state?.testPath) return null;

  // test.concurrent bodies run alongside other tests; Jest tracks their names in
  // AsyncLocalStorage, the same way jest-snapshot resolves the current test. Jest 30 reports
  // sequential tests there too, so a name equal to `currentTestName` is a sequential test.
  const concurrentName = state.currentConcurrentTestName?.();
  if (concurrentName && concurrentName !== state.currentTestName) {
    return { testPath: state.testPath, testName: concurrentName, invocation: 1 };
  }

  if (!state.currentTestName) return null;

  // circus keeps `currentTestName` set after a test ends, so a call from a following
  // beforeAll/afterAll would land on the finished test. Skipped and todo tests become the
  // running test without ever finishing, so their status is checked too. A retried test keeps
  // the `done` status of its previous attempt, so that status cannot be used.
  const running = circusRunningTest();
  if (running === null) return null;
  if (running && (running.status === 'skip' || running.status === 'todo')) return null;

  return {
    testPath: state.testPath,
    testName: state.currentTestName,
    invocation: running?.invocations ?? 1,
  };
};

/**
 * Collects `qase.*` calls in the process that runs the test.
 */
export class MetadataWriter {
  private readonly appliers = new Map<string, MetadataApplier>();

  constructor(
    private readonly dir: string | undefined = process.env[METADATA_DIR_ENV],
    private readonly resolveTest: () => CurrentTest | null = currentTest,
  ) {}

  title(value: string): void {
    this.apply((m) => m.applyTitle(value));
  }

  ignore(): void {
    this.apply((m) => m.applyIgnore());
  }

  mute(): void {
    this.apply((m) => m.applyMute());
  }

  comment(value: string): void {
    this.apply((m) => m.applyComment(value));
  }

  suite(value: string): void {
    this.apply((m) => m.applySuite(value));
  }

  fields(values: Record<string, string>): void {
    this.apply((m) => m.applyFields(toStringRecord(values)));
  }

  parameters(values: Record<string, string>): void {
    this.apply((m) => m.applyParameters(toStringRecord(values)));
  }

  groupParams(values: Record<string, string>): void {
    this.apply((m) => m.applyGroupParams(toStringRecord(values)));
  }

  tags(values: string[]): void {
    this.apply((m) => m.applyTags(values));
  }

  step(step: TestStepType): void {
    this.apply((m) => m.applyStep(step));
  }

  attachment(attachment: Attachment): void {
    this.apply((m) => m.applyAttachment(attachment));
  }

  private apply(change: (applier: MetadataApplier) => void): void {
    // Without the reporter (or outside a test, e.g. in beforeAll) there is no result to attach to.
    if (!this.dir) return;
    const test = this.resolveTest();
    if (!test) return;

    const file = metadataFile(this.dir, test);
    let applier = this.appliers.get(file);
    if (!applier) {
      applier = new MetadataApplier();
      this.appliers.set(file, applier);
    }
    change(applier);
    // Written synchronously on every call: the test's result is sent to the reporter right after
    // the test ends, and nothing in the worker runs between the last call and that message.
    try {
      // Through a rename, so the reporter never reads a half-written file.
      const tmp = `${file}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(applier.get()));
      renameSync(tmp, file);
    } catch {
      // Losing metadata must not fail the user's test.
    }
  }
}

/**
 * Owns the metadata directory and reads each test's metadata in the reporter process.
 */
export class MetadataReader {
  readonly dir: string;

  constructor() {
    this.dir = mkdtempSync(join(tmpdir(), 'qase-jest-'));
    process.env[METADATA_DIR_ENV] = this.dir;
    // Not on run completion: in watch mode the same reporter serves the next run.
    process.once('exit', () => this.cleanup());
  }

  take(testPath: string, testName: string, invocation = 1): Metadata {
    const file = metadataFile(this.dir, { testPath, testName, invocation });
    try {
      const raw = readFileSync(file, 'utf8');
      unlinkSync(file);
      return { ...MetadataApplier.empty(), ...(JSON.parse(raw) as Partial<Metadata>) };
    } catch {
      // No file means the test made no qase.* calls; a reporting error must not stop the run.
      return MetadataApplier.empty();
    }
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}

const toStringRecord = (values: Record<string, string>): Record<string, string> => {
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    record[String(key)] = String(value);
  }
  return record;
};

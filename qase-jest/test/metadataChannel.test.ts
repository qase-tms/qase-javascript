/* eslint-disable */
import { expect } from '@jest/globals';
import { readdirSync, readFileSync } from 'fs';
import { METADATA_DIR_ENV, MetadataReader, MetadataWriter } from '../src/metadataChannel';

// These tests run inside real jest-circus, so the writer resolves the current test from Jest's
// own state, exactly as it does in a worker.
const reader = new MetadataReader();
const writer = new MetadataWriter(reader.dir);
const testPath = expect.getState().testPath as string;
// Concurrent tests below start before the rest of the file, so the directory is not empty here.
const written = () =>
  readdirSync(reader.dir).map((f) => readFileSync(`${reader.dir}/${f}`, 'utf8')).join('\n');

afterAll(() => {
  reader.cleanup();
});

describe('MetadataReader', () => {
  it('hands its directory to worker processes through the environment', () => {
    expect(process.env[METADATA_DIR_ENV]).toBe(reader.dir);
  });

  it('returns empty metadata for a test that made no calls', () => {
    expect(reader.take(testPath, 'unknown test').title).toBeUndefined();
  });
});

describe('MetadataWriter', () => {
  it('writes metadata for the running test', () => {
    writer.title('T');
    writer.tags(['a']);
    writer.tags(['b']);
    writer.fields({ severity: 'major' });
    writer.mute();

    const metadata = reader.take(testPath, 'MetadataWriter writes metadata for the running test');
    expect(metadata.title).toBe('T');
    expect(metadata.tags).toEqual(['a', 'b']);
    expect(metadata.fields).toEqual({ severity: 'major' });
    expect(metadata.mute).toBe(true);
    expect(reader.take(testPath, 'MetadataWriter writes metadata for the running test').title).toBeUndefined();
  });

  it('keeps tests in different files apart', () => {
    const other = new MetadataWriter(reader.dir, () => ({
      testPath: '/other/file.test.js',
      testName: 'MetadataWriter keeps tests in different files apart',
      invocation: 1,
    }));
    other.title('other');
    writer.title('this');

    expect(reader.take(testPath, 'MetadataWriter keeps tests in different files apart').title).toBe('this');
    expect(reader.take('/other/file.test.js', 'MetadataWriter keeps tests in different files apart').title).toBe('other');
  });

  it('does nothing without a metadata directory', () => {
    expect(() => new MetadataWriter(undefined).title('T')).not.toThrow();
  });

  it('does not throw when the directory is gone', () => {
    expect(() => new MetadataWriter('/nonexistent/qase-dir').title('T')).not.toThrow();
  });
});

describe('MetadataWriter outside a running test', () => {
  beforeAll(() => {
    writer.comment('from beforeAll');
  });

  it.skip('skipped test', () => {});
  it.todo('todo test');

  it('ignores calls from beforeAll, even after a skipped or todo test', () => {
    // The skipped/todo tests above stay `currentlyRunningTest` in circus and never finish.
    expect(written()).not.toContain('from beforeAll');
  });

  describe('nested after skip and todo', () => {
    it.todo('another todo');

    describe('inner', () => {
      beforeAll(() => {
        writer.comment('from nested beforeAll');
      });

      it('still ignores beforeAll', () => {
        expect(written()).not.toContain('from nested beforeAll');
      });
    });
  });
});

describe('MetadataWriter with beforeEach', () => {
  beforeEach(() => {
    writer.tags(['from beforeEach']);
  });

  it('applies beforeEach calls to the test', () => {
    const metadata = reader.take(testPath, 'MetadataWriter with beforeEach applies beforeEach calls to the test');
    expect(metadata.tags).toEqual(['from beforeEach']);
  });
});

describe('MetadataWriter with concurrent tests', () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it.concurrent('concurrent a', async () => {
    writer.fields({ c: 'a-before' });
    await sleep(30);
    writer.parameters({ x: 'a' });
  });

  it.concurrent('concurrent b', async () => {
    writer.fields({ c: 'b-before' });
    await sleep(5);
    writer.parameters({ x: 'b' });
  });

  it('attributes calls after await to the concurrent test that made them', () => {
    const a = reader.take(testPath, 'MetadataWriter with concurrent tests concurrent a');
    const b = reader.take(testPath, 'MetadataWriter with concurrent tests concurrent b');
    expect(a.fields).toEqual({ c: 'a-before' });
    expect(a.parameters).toEqual({ x: 'a' });
    expect(b.fields).toEqual({ c: 'b-before' });
    expect(b.parameters).toEqual({ x: 'b' });
  });
});

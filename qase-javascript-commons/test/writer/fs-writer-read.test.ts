import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { FsWriter } from '../../src/writer/fs-writer';
import { FormatEnum } from '../../src/writer';

describe('FsWriter.readTestResults', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'qase-fs-writer-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns nothing when no result was written', () => {
    expect(new FsWriter({ path: dir }).readTestResults()).toEqual([]);
  });

  it('reads back the results written in json and jsonp', async () => {
    for (const format of [FormatEnum.json, FormatEnum.jsonp]) {
      const root = path.join(dir, format);
      const writer = new FsWriter({ path: root, format });
      await writer.writeTestResult({ id: 'a', title: 'A' } as never);
      await writer.writeTestResult({ id: 'b', title: 'B' } as never);

      const ids = writer.readTestResults().map((r) => r.id).sort();
      expect(ids).toEqual(['a', 'b']);
    }
  });

  it('skips files it cannot parse', async () => {
    const writer = new FsWriter({ path: dir, format: FormatEnum.json });
    await writer.writeTestResult({ id: 'a', title: 'A' } as never);
    mkdirSync(path.join(dir, 'results'), { recursive: true });
    writeFileSync(path.join(dir, 'results', 'half.json'), '{"id": "b"');

    expect(writer.readTestResults().map((r) => r.id)).toEqual(['a']);
  });
});

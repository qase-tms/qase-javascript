/* eslint-disable */
import { describe, expect, it, afterAll } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ResultsManager } from '../src/metadata/resultsManager';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qase-cypress-results-'));
const originalPath = ResultsManager.resultsPath;

describe('ResultsManager', () => {
  afterAll(() => {
    ResultsManager.resultsPath = originalPath;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('keeps Buffer attachment content of results and their steps', () => {
    ResultsManager.resultsPath = path.join(dir, 'qaseResults');
    const attachment = (content: Buffer | string) => ({ file_name: 'a', mime_type: 'text/plain', file_path: null, size: 0, id: 'x', content });
    ResultsManager.setResults([{
      attachments: [attachment(Buffer.from('test')), attachment('text')],
      steps: [{ attachments: [attachment(Buffer.from('step'))], steps: [] }],
    } as any]);

    const [result] = ResultsManager.getResults() as any[];
    expect(Buffer.isBuffer(result.attachments[0].content)).toBe(true);
    expect(result.attachments[0].content.toString()).toBe('test');
    expect(result.attachments[1].content).toBe('text');
    expect(result.steps[0].attachments[0].content.toString()).toBe('step');
    expect(Buffer.isBuffer(result.steps[0].attachments[0].content)).toBe(true);
  });
});

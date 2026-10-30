/* eslint-disable */
import { expect } from '@jest/globals';
import { MetadataReader, MetadataWriter } from '../src/metadataChannel';

// Separate file: jest.retryTimes applies to every test in the file.
jest.retryTimes(1);

const reader = new MetadataReader();
const writer = new MetadataWriter(reader.dir);
const testPath = expect.getState().testPath as string;
let attempt = 0;

afterAll(() => {
  reader.cleanup();
});

describe('MetadataWriter with retries', () => {
  it('fails on the first attempt', () => {
    attempt++;
    writer.tags([`attempt-${attempt}`]);
    expect(attempt).toBe(2);
  });
});

// circus re-runs failed tests at the end of their describe block, so this check lives in the next one.
describe('after the retried block', () => {
  it('keeps each attempt separate, as each is reported as its own result', () => {
    const name = 'MetadataWriter with retries fails on the first attempt';
    expect(reader.take({ project: '', testPath, testName: name, invocation: 1 }).tags).toEqual(['attempt-1']);
    expect(reader.take({ project: '', testPath, testName: name, invocation: 2 }).tags).toEqual(['attempt-2']);
  });
});

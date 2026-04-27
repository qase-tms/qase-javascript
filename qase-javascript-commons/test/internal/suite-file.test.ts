import { describe, expect, it } from '@jest/globals';
import { getFile, FileSuiteNode } from '../../src/internal/suite-file';

describe('getFile', () => {
  it('returns the suite file when present on the node itself', () => {
    const suite: FileSuiteNode = { file: '/tests/foo.spec.ts' };
    expect(getFile(suite)).toBe('/tests/foo.spec.ts');
  });

  it('walks up the parent chain', () => {
    const root: FileSuiteNode = { file: '/tests/bar.spec.ts' };
    const child: FileSuiteNode = { parent: root };
    const grandchild: FileSuiteNode = { parent: child };
    expect(getFile(grandchild)).toBe('/tests/bar.spec.ts');
  });

  it('returns undefined when no ancestor has a file', () => {
    const root: FileSuiteNode = {};
    const child: FileSuiteNode = { parent: root };
    expect(getFile(child)).toBeUndefined();
  });

  it('returns undefined for an empty leaf', () => {
    expect(getFile({})).toBeUndefined();
  });
});

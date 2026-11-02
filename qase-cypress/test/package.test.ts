/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import pkg from '../package.json';

describe('package.json', () => {
  it('points the root types at the declarations of the root export', () => {
    expect(pkg.types).toBe(pkg.exports['.'].replace(/\.js$/, '.d.ts'));
  });
});

import { describe, expect, it } from '@jest/globals';
import type * as Mocha from 'mocha';
import { parseExtraReporters } from '../src/extraReporters';

const fromCli = (reporterOptions: Record<string, unknown>) =>
  parseExtraReporters({ reporterOptions } as Mocha.MochaOptions);

describe('parseExtraReporters', () => {
  it('keeps a single reporter name', () => {
    expect(fromCli({ extraReporters: 'spec' })).toBe('spec');
  });

  // Mocha splits `--reporter-option` on ',', so ';' is the separator that survives the CLI.
  it('splits several reporters separated by ";"', () => {
    expect(fromCli({ extraReporters: 'spec;json' })).toEqual(['spec', 'json']);
  });

  it('splits several reporters separated by "," from a config file', () => {
    expect(parseExtraReporters({}, { extraReporters: 'spec, json' })).toEqual(['spec', 'json']);
  });

  it('keeps arrays and objects as they are', () => {
    expect(fromCli({ extraReporters: ['spec', { name: 'json' }] })).toEqual(['spec', { name: 'json' }]);
    expect(fromCli({ extraReporters: { name: 'json' } })).toEqual({ name: 'json' });
  });
});

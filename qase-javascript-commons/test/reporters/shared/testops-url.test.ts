import { expect } from '@jest/globals';
import { resolveTestOpsBaseUrl } from '../../../src/reporters/shared/testops-url';

describe('resolveTestOpsBaseUrl', () => {
  it('returns default app URL when host is undefined', () => {
    expect(resolveTestOpsBaseUrl(undefined)).toBe('https://app.qase.io');
  });

  it('returns default app URL for canonical "qase.io" host', () => {
    expect(resolveTestOpsBaseUrl('qase.io')).toBe('https://app.qase.io');
  });

  it('rewrites "api" subdomain to "app" for custom hosts', () => {
    expect(resolveTestOpsBaseUrl('api.custom.example')).toBe('https://app.custom.example');
  });

  it('prepends https scheme even when host has no "api" substring', () => {
    expect(resolveTestOpsBaseUrl('staging.example')).toBe('https://staging.example');
  });

  it('handles empty string as undefined', () => {
    expect(resolveTestOpsBaseUrl('')).toBe('https://app.qase.io');
  });

  // Regression: the rewrite used an unanchored substring replace, so any host merely containing
  // the letters "api" was corrupted (capital.qase.io — capptal.qase.io).
  for (const host of ['capital.qase.io', 'rapid.qase.io', 'therapist.example']) {
    it(`does not corrupt "${host}", which only contains "api"`, () => {
      expect(resolveTestOpsBaseUrl(host)).toBe(`https://${host}`);
    });
  }

  describe('full base URL', () => {
    const cases: [string, string][] = [
      ['http://api.qase.lo', 'http://app.qase.lo'],
      ['https://api.qase.io', 'https://app.qase.io'],
      ['http://api.qase.lo:8080', 'http://app.qase.lo:8080'],
      ['http://api.qase.lo/', 'http://app.qase.lo'],
      ['https://qase.internal/tms', 'https://qase.internal/tms'],
    ];

    for (const [host, expected] of cases) {
      it(`resolves "${host}" to "${expected}"`, () => {
        expect(resolveTestOpsBaseUrl(host)).toBe(expected);
      });
    }
  });
});

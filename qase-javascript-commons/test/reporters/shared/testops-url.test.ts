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
});

import { expect } from '@jest/globals';
import {
  apiLabelToApp,
  apiLabelToAppInUrl,
  isAbsoluteUrl,
  stripTrailingSlashes,
} from '../../src/utils/api-host';

describe('api-host', () => {
  describe('isAbsoluteUrl', () => {
    const absolute = ['http://api.qase.lo', 'https://api.qase.io', 'HTTPS://API.QASE.IO', 'http://localhost:8080'];
    const relative = ['qase.io', 'api.qase.io', 'ftp://qase.io', '//qase.io', ''];

    for (const host of absolute) {
      it(`treats "${host}" as a full URL`, () => {
        expect(isAbsoluteUrl(host)).toBe(true);
      });
    }

    for (const host of relative) {
      it(`treats "${host}" as a host fragment`, () => {
        expect(isAbsoluteUrl(host)).toBe(false);
      });
    }
  });

  describe('stripTrailingSlashes', () => {
    const cases: [string, string][] = [
      ['https://qase.internal/tms/', 'https://qase.internal/tms'],
      ['https://qase.internal///', 'https://qase.internal'],
      ['https://qase.internal', 'https://qase.internal'],
    ];

    for (const [input, expected] of cases) {
      it(`strips "${input}" to "${expected}"`, () => {
        expect(stripTrailingSlashes(input)).toBe(expected);
      });
    }
  });

  describe('apiLabelToApp', () => {
    it('rewrites a leading api. label', () => {
      expect(apiLabelToApp('api.custom.example')).toBe('app.custom.example');
    });

    // An unanchored substring replace corrupted these — the whole reason the helper is anchored.
    for (const host of ['capital.qase.io', 'rapid.qase.io', 'therapist.example', 'staging.example']) {
      it(`leaves "${host}" untouched`, () => {
        expect(apiLabelToApp(host)).toBe(host);
      });
    }

    it('only rewrites the first label, not a later api.', () => {
      expect(apiLabelToApp('eu.api.qase.io')).toBe('eu.api.qase.io');
    });
  });

  describe('apiLabelToAppInUrl', () => {
    const cases: [string, string][] = [
      ['http://api.qase.lo', 'http://app.qase.lo'],
      ['https://api.qase.io', 'https://app.qase.io'],
      ['http://api.qase.lo:8080', 'http://app.qase.lo:8080'],
      ['https://capital.qase.io', 'https://capital.qase.io'],
      ['https://qase.internal/tms', 'https://qase.internal/tms'],
    ];

    for (const [input, expected] of cases) {
      it(`rewrites "${input}" to "${expected}"`, () => {
        expect(apiLabelToAppInUrl(input)).toBe(expected);
      });
    }
  });
});

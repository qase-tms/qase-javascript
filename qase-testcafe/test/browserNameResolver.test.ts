/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { BrowserNameResolver } from '../src/modules/browserNameResolver';
import { TestRunInfoType } from '../src/types';

function makeInfo(overrides: Partial<TestRunInfoType> = {}): TestRunInfoType {
  return {
    errs: [],
    warnings: [],
    durationMs: 0,
    unstable: false,
    screenshotPath: '',
    screenshots: [],
    quarantine: {},
    skipped: false,
    fixture: { id: 'f', name: 'F', path: '/p.ts', meta: {} },
    ...overrides,
  } as TestRunInfoType;
}

describe('BrowserNameResolver', () => {
  it('resolves from screenshot.userAgent first', () => {
    const info = makeInfo({
      screenshots: [{ screenshotPath: '', thumbnailPath: '', userAgent: 'Chrome 97.0 / macOS 10.15', quarantineAttempt: 0, takenOnFail: false }],
    });
    expect(BrowserNameResolver.resolve(info, ['Firefox 96.0 / Linux 0.0'])).toBe('chrome');
  });

  it('falls back to errs[0].userAgent when no screenshots', () => {
    const info = makeInfo({
      errs: [{ userAgent: 'Firefox 96.0 / Linux 0.0', screenshotPath: '', testRunId: '', testRunPhase: '', type: '', errMsg: 'x' }],
    });
    expect(BrowserNameResolver.resolve(info, [])).toBe('firefox');
  });

  it('falls back to single stored userAgent when info has none', () => {
    const info = makeInfo();
    expect(BrowserNameResolver.resolve(info, ['Safari 15.0 / macOS 11.0'])).toBe('safari');
  });

  it('returns null when no source available', () => {
    expect(BrowserNameResolver.resolve(makeInfo(), [])).toBeNull();
  });

  it('parseBrowserName handles space and underscore separators, lowercases', () => {
    expect(BrowserNameResolver.parseBrowserName('Chrome 97.0.4692.71 / macOS 10.15.7')).toBe('chrome');
    expect(BrowserNameResolver.parseBrowserName('Chrome_97.0.4692.71_macOS_10.15.7')).toBe('chrome');
    expect(BrowserNameResolver.parseBrowserName('Firefox 96.0 / Linux 0.0')).toBe('firefox');
  });
});

/* eslint-disable */
import { expect } from '@jest/globals';

const qaseReporterMock = {
  startTestRunAsync: jest.fn(async () => {}),
  complete: jest.fn(async () => {}),
  setTestResults: jest.fn(),
  sendResults: jest.fn(async () => {}),
  uploadAttachment: jest.fn(async () => 'hash'),
};

const composeOptionsMock = jest.fn((userOptions: unknown, _config: unknown) => ({
  passedUserOptions: userOptions,
}));

jest.mock('qase-javascript-commons', () => ({
  QaseReporter: {
    getInstance: jest.fn(() => qaseReporterMock),
  },
  composeOptions: composeOptionsMock,
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({ loadedFromConfig: true })),
  })),
}));

jest.mock('../src/metadata/resultsManager', () => ({
  ResultsManager: {
    getResults: jest.fn(() => undefined),
    clear: jest.fn(),
  },
}));

jest.mock('../src/fileSearcher', () => ({
  FileSearcher: { findVideoFiles: jest.fn(() => []) },
}));

import { beforeRunHook, afterRunHook, afterSpecHook } from '../src/hooks';

describe('hooks defensive option handling', () => {
  beforeEach(() => {
    composeOptionsMock.mockClear();
    qaseReporterMock.startTestRunAsync.mockClear();
    qaseReporterMock.complete.mockClear();
    qaseReporterMock.sendResults.mockClear();
  });

  describe('beforeRunHook', () => {
    it('does not throw when reporterOptions is null', async () => {
      await expect(beforeRunHook({ reporterOptions: null } as any)).resolves.not.toThrow();
      expect(qaseReporterMock.startTestRunAsync).toHaveBeenCalled();
    });

    it('does not throw when reporterOptions is undefined', async () => {
      await expect(beforeRunHook({} as any)).resolves.not.toThrow();
      expect(qaseReporterMock.startTestRunAsync).toHaveBeenCalled();
    });

    it('uses the cypress-multi-reporters wrapper key when present', async () => {
      const inner = { testops: { project: 'P' } };
      await beforeRunHook({
        reporterOptions: { cypressQaseReporterReporterOptions: inner },
      } as any);
      expect(composeOptionsMock).toHaveBeenCalledWith(inner, expect.anything());
    });

    it('falls back to raw reporterOptions when wrapper key is absent', async () => {
      const raw = { testops: { project: 'P' }, mode: 'testops' };
      await beforeRunHook({ reporterOptions: raw } as any);
      expect(composeOptionsMock).toHaveBeenCalledWith(raw, expect.anything());
    });
  });

  describe('afterRunHook', () => {
    it('does not throw when reporterOptions is null', async () => {
      await expect(afterRunHook({ reporterOptions: null } as any)).resolves.not.toThrow();
      expect(qaseReporterMock.complete).toHaveBeenCalled();
    });

    it('falls back to raw reporterOptions when wrapper key is absent', async () => {
      const raw = { testops: { project: 'P' } };
      await afterRunHook({ reporterOptions: raw } as any);
      expect(composeOptionsMock).toHaveBeenCalledWith(raw, expect.anything());
    });
  });

  describe('afterSpecHook', () => {
    const fakeSpec = { name: 'x.cy.js', relative: 'cypress/e2e/x.cy.js' } as any;

    it('does not throw when reporterOptions is null and there are no buffered results', async () => {
      await expect(
        afterSpecHook(fakeSpec, { reporterOptions: null } as any),
      ).resolves.not.toThrow();
    });

    it('does not throw when reporterOptions is null and there ARE buffered results', async () => {
      const { ResultsManager } = jest.requireMock('../src/metadata/resultsManager');
      (ResultsManager.getResults as jest.Mock).mockReturnValueOnce([{ id: 'r1' }]);
      await expect(
        afterSpecHook(fakeSpec, { reporterOptions: null } as any),
      ).resolves.not.toThrow();
      expect(qaseReporterMock.sendResults).toHaveBeenCalled();
    });
  });
});

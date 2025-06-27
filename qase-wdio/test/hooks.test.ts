/* eslint-disable */
import { expect } from '@jest/globals';
import { beforeRunHook, afterRunHook } from '../src/hooks';

// Mock dependencies
const mockReporter = {
  startTestRunAsync: jest.fn().mockResolvedValue(undefined),
  complete: jest.fn().mockResolvedValue(undefined),
};

jest.mock('qase-javascript-commons', () => ({
  QaseReporter: {
    getInstance: jest.fn(() => mockReporter),
  },
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
}));

describe('hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('beforeRunHook', () => {
    it('should initialize reporter and start test run', async () => {
      const { QaseReporter, ConfigLoader } = require('qase-javascript-commons');

      await beforeRunHook();

      expect(ConfigLoader).toHaveBeenCalled();
      expect(QaseReporter.getInstance).toHaveBeenCalledWith({
        frameworkPackage: '@wdio/cli',
        frameworkName: 'wdio',
        reporterName: 'wdio-qase-reporter',
      });
      expect(mockReporter.startTestRunAsync).toHaveBeenCalled();
    });
  });

  describe('afterRunHook', () => {
    it('should get reporter instance and complete test run', async () => {
      const { QaseReporter, ConfigLoader } = require('qase-javascript-commons');

      await afterRunHook();

      expect(ConfigLoader).toHaveBeenCalled();
      expect(QaseReporter.getInstance).toHaveBeenCalledWith({
        frameworkPackage: 'wdio',
        frameworkName: 'wdio',
        reporterName: 'wdio-qase-reporter',
      });
      expect(mockReporter.complete).toHaveBeenCalled();
    });
  });
}); 

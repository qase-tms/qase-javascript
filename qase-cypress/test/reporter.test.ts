/* eslint-disable */
import { expect } from '@jest/globals';
import { CypressQaseReporter } from '../src/reporter';
import { Test, Suite } from 'mocha';
import { TestStatusEnum } from 'qase-javascript-commons';

// Mock dependencies
const qaseReporterMock = {
  addTestResult: jest.fn(),
  getResults: jest.fn(() => [{ id: 'test-result' }]),
  publish: jest.fn(),
};

jest.mock('qase-javascript-commons', () => {
  const parseProjectMappingFromTitle = jest.fn((title: string) => {
    const idMatch = title.match(/\(Qase\s+ID:?\s*([\d,]+)\)/i);
    if (idMatch) {
      const legacyIds = idMatch[1]!.split(',').map((s) => parseInt(s.trim(), 10));
      return { legacyIds, projectMapping: {}, cleanedTitle: title.replace(idMatch[0], '').trim() };
    }
    const projRegex = /\(Qase\s+([A-Za-z0-9_]+):\s*([\d,]+)\)/gi;
    const projectMapping: Record<string, number[]> = {};
    let cleanedTitle = title;
    let m;
    while ((m = projRegex.exec(title)) !== null) {
      if (m[1]!.toUpperCase() !== 'ID') {
        const ids = (m[2] ?? '').split(',').map((s) => parseInt(s.trim(), 10));
        projectMapping[m[1]!] = ids;
      }
      cleanedTitle = cleanedTitle.replace(m[0], '').trim();
    }
    return { legacyIds: [], projectMapping, cleanedTitle: cleanedTitle || title };
  });
  return {
    QaseReporter: {
      getInstance: jest.fn(() => qaseReporterMock),
    },
    composeOptions: jest.fn(() => ({
      framework: { cypress: { screenshotsFolder: '/screenshots' } },
      frameworkPackage: 'cypress',
      frameworkName: 'cypress',
      reporterName: 'cypress-qase-reporter',
    })),
    TestStatusEnum: {
      passed: 'passed',
      failed: 'failed',
      skipped: 'skipped',
    },
    generateSignature: jest.fn(() => 'mock-signature'),
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'pending') return 'skipped';
      return 'failed';
    }),
    parseProjectMappingFromTitle,
    parseProjectMappingFromTags: jest.fn(() => ({ legacyIds: [], projectMapping: {} })),
    ConfigLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(() => ({})),
    })),
  };
});

jest.mock('../src/metadata/manager', () => {
  const metadataManagerMock = {
    getMetadata: jest.fn(() => ({ ignore: false, attachments: [] })),
    clear: jest.fn(),
  };
  return {
    MetadataManager: metadataManagerMock,
  };
});

jest.mock('../src/fileSearcher', () => ({
  FileSearcher: {
    findFilesBeforeTime: jest.fn(() => ['/screenshots/test.png']),
  },
}));

jest.mock('child_process', () => ({
  spawnSync: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('CypressQaseReporter', () => {
  let runner: any;
  let eventHandlers: Record<string, Function>;
  let test: Test;
  let suite: Suite;
  let metadataManagerMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked MetadataManager
    const { MetadataManager } = require('../src/metadata/manager');
    metadataManagerMock = MetadataManager;
    
    eventHandlers = {};
    runner = {
      on: jest.fn((event, handler) => {
        eventHandlers[event] = handler;
      }),
      once: jest.fn((event, handler) => {
        eventHandlers[event] = handler;
      }),
    };

    suite = {
      title: 'Test Suite',
      titlePath: jest.fn(() => ['Root Suite', 'Test Suite']),
    } as unknown as Suite;

    test = {
      title: 'Test Case (Qase ID: 123)',
      parent: suite,
      file: '/path/to/test.cy.js',
      state: 'passed',
      duration: 1000,
      slow: jest.fn(),
      fullTitle: jest.fn(() => 'Test Case (Qase ID: 123)'),
    } as unknown as Test;
  });

  describe('static methods', () => {
    it('should map cypress states to test statuses', () => {
      expect(CypressQaseReporter.statusMap.failed).toBe(TestStatusEnum.failed);
      expect(CypressQaseReporter.statusMap.passed).toBe(TestStatusEnum.passed);
      expect(CypressQaseReporter.statusMap.pending).toBe(TestStatusEnum.skipped);
    });
  });

  describe('parseProjectMappingFromTitle usage', () => {
    it('should call parseProjectMappingFromTitle with test title when adding result', () => {
      const { parseProjectMappingFromTitle } = require('qase-javascript-commons');
      const options = { reporterOptions: { screenshotsFolder: '/screenshots' } };
      new CypressQaseReporter(runner, options);
      const testWithQaseId = { ...test, title: 'Test (Qase ID: 123,456)' };
      if (eventHandlers['pass']) eventHandlers['pass'](testWithQaseId);
      expect(parseProjectMappingFromTitle).toHaveBeenCalledWith('Test (Qase ID: 123,456)');
    });
  });

  describe('constructor', () => {
    it('should initialize reporter with correct options', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      const { QaseReporter } = require('qase-javascript-commons');
      expect(QaseReporter.getInstance).toHaveBeenCalledWith({
        frameworkPackage: 'cypress',
        frameworkName: 'cypress',
        reporterName: 'cypress-qase-reporter',
      });
    });

    it('should add event listeners to runner', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      expect(runner.on).toHaveBeenCalledWith('pass', expect.any(Function));
      expect(runner.on).toHaveBeenCalledWith('pending', expect.any(Function));
      expect(runner.on).toHaveBeenCalledWith('fail', expect.any(Function));
      expect(runner.on).toHaveBeenCalledWith('test', expect.any(Function));
      expect(runner.once).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });

  describe('addTestResult', () => {
    it('should add test result for passed test', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      const passedTest = { ...test, state: 'passed' };
      
      if (eventHandlers['pass']) eventHandlers['pass'](passedTest);

      expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          execution: expect.objectContaining({
            status: TestStatusEnum.passed,
          }),
        })
      );
    });

    it('should add test result for failed test', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      const failedTest = { ...test, state: 'failed' };
      
      if (eventHandlers['fail']) eventHandlers['fail'](failedTest);

      expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          execution: expect.objectContaining({
            status: TestStatusEnum.failed,
          }),
        })
      );
    });

    it('should add test result for pending test', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      const pendingTest = { ...test, state: 'pending' };
      
      if (eventHandlers['pending']) eventHandlers['pending'](pendingTest);

      expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          execution: expect.objectContaining({
            status: TestStatusEnum.skipped,
          }),
        })
      );
    });

    it('should not add test result if test is ignored', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      metadataManagerMock.getMetadata.mockReturnValue({ ignore: true, attachments: [] });
      
      if (eventHandlers['pass']) eventHandlers['pass'](test);

      expect(qaseReporterMock.addTestResult).not.toHaveBeenCalled();
      expect(metadataManagerMock.clear).toHaveBeenCalled();
    });

    it('should include attachments from metadata', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      const mockAttachment = {
        content: 'test',
        id: 'attachment-id',
        mime_type: 'text/plain',
        size: 10,
        file_name: 'test.txt',
        file_path: null,
      };
      
      metadataManagerMock.getMetadata.mockReturnValue({
        ignore: false,
        attachments: [mockAttachment as any],
      });
      
      if (eventHandlers['pass']) eventHandlers['pass'](test);

      expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              file_name: 'test.png',
              mime_type: 'image/png',
            }),
            mockAttachment,
          ]),
        })
      );
    });

    it('should include suite relations', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      if (eventHandlers['pass']) eventHandlers['pass'](test);

      expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: {
            suite: {
              data: [
                { title: 'Root Suite', public_id: null },
                { title: 'Test Suite', public_id: null },
              ],
            },
          },
        })
      );
    });
  });

  describe('test begin handler', () => {
    it('should clear metadata and update test begin time', () => {
      const options = {
        reporterOptions: {
          screenshotsFolder: '/screenshots',
        },
      };

      new CypressQaseReporter(runner, options);

      if (eventHandlers['test']) eventHandlers['test']();

      expect(metadataManagerMock.clear).toHaveBeenCalled();
    });
  });
}); 

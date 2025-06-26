/* eslint-disable */

import { expect } from '@jest/globals';
import { FsWriter } from '../../src/writer/fs-writer';
import { JsonFormatter } from '../../src/formatter/json-formatter';
import { JsonpFormatter } from '../../src/formatter/jsonp-formatter';
import { FormatEnum } from '../../src/writer';
import { Attachment, Report, TestResultType } from '../../src/models';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn(),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  lstatSync: jest.fn(),
  unlinkSync: jest.fn(),
  rmdirSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  basename: jest.fn((p: string) => p.split('/').pop() ?? ''),
}));

describe('FsWriter', () => {
  const mockMkdirSync = jest.mocked(fs.mkdirSync);
  const mockWriteFileSync = jest.mocked(fs.writeFileSync);
  const mockCopyFileSync = jest.mocked(fs.copyFileSync);
  const mockExistsSync = jest.mocked(fs.existsSync);
  const mockReaddirSync = jest.mocked(fs.readdirSync);
  const mockLstatSync = jest.mocked(fs.lstatSync);
  const mockUnlinkSync = jest.mocked(fs.unlinkSync);
  const mockRmdirSync = jest.mocked(fs.rmdirSync);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const writer = new FsWriter(undefined);
      expect(writer).toBeInstanceOf(FsWriter);
      expect(writer['formatter']).toBeInstanceOf(JsonFormatter);
    });

    it('should initialize with custom path and JSON format', () => {
      const writer = new FsWriter({ path: 'custom/path', format: FormatEnum.json });
      expect(writer['path']).toBe('custom/path');
      expect(writer['format']).toBe(FormatEnum.json);
      expect(writer['formatter']).toBeInstanceOf(JsonFormatter);
    });

    it('should initialize with JSONP format', () => {
      const writer = new FsWriter({ format: FormatEnum.jsonp });
      expect(writer['formatter']).toBeInstanceOf(JsonpFormatter);
    });
  });

  describe('clearPreviousResults', () => {
    it('should call deleteFolderRecursive with path', () => {
      const writer = new FsWriter({ path: 'test-path' });
      const deleteFolderRecursiveSpy = jest.spyOn(writer as any, 'deleteFolderRecursive');
      
      writer.clearPreviousResults();
      
      expect(deleteFolderRecursiveSpy).toHaveBeenCalledWith('test-path');
    });
  });

  describe('writeAttachment', () => {
    it('should create attachments directory and copy files', () => {
      const writer = new FsWriter({ path: 'test-path' });
      const attachments: Attachment[] = [
        { 
          id: '1', 
          file_path: '/source/file1.txt', 
          file_name: 'file1.txt', 
          mime_type: 'text/plain',
          content: 'content1',
          size: 8,
        },
        { 
          id: '2', 
          file_path: null, 
          file_name: 'file2.txt', 
          mime_type: 'text/plain',
          content: 'content2',
          size: 8,
        },
      ];

      const result = writer.writeAttachment(attachments);

      expect(mockMkdirSync).toHaveBeenCalledWith('test-path/attachments', { recursive: true });
      expect(mockCopyFileSync).toHaveBeenCalledWith('/source/file1.txt', 'test-path/attachments/1-file1.txt');
      expect(mockWriteFileSync).toHaveBeenCalledWith('test-path/attachments/2-file2.txt', 'content2');
      expect(result[0]?.file_path).toBe('test-path/attachments/1-file1.txt');
      expect(result[1]?.file_path).toBe('test-path/attachments/2-file2.txt');
    });

    it('should handle mkdirSync error gracefully', () => {
      const writer = new FsWriter({ path: 'test-path' });
      mockMkdirSync.mockImplementation(() => {
        throw new Error('Directory exists');
      });

      const attachments: Attachment[] = [
        { 
          id: '1', 
          file_path: '/source/file.txt', 
          file_name: 'file.txt', 
          mime_type: 'text/plain',
          content: 'content',
          size: 7,
        },
      ];

      expect(() => writer.writeAttachment(attachments)).not.toThrow();
      expect(mockCopyFileSync).toHaveBeenCalled();
    });
  });

  describe('writeReport', () => {
    it('should create directory and write report file', async () => {
      const writer = new FsWriter({ path: 'test-path', format: FormatEnum.json });
      const report: Report = {
        title: 'Test Report',
        environment: 'test',
        execution: { start_time: 0, end_time: 0, duration: 0, cumulative_duration: 0 },
        host_data: {
          framework: 'test',
          reporter: 'test',
          system: 'test',
          machineName: 'test',
          release: 'test',
          version: 'test',
          arch: 'test',
          node: 'test',
          npm: 'test',
          commons: 'test',
          apiClientV1: 'test',
          apiClientV2: 'test',
        },
        stats: { total: 0, passed: 0, failed: 0, skipped: 0, broken: 0, muted: 0 },
        results: [],
        threads: [],
        suites: [],
      };

      // Mock formatter
      writer['formatter'].format = jest.fn().mockResolvedValue('formatted-report');

      const result = await writer.writeReport(report);

      expect(mockMkdirSync).toHaveBeenCalledWith('test-path', { recursive: true });
      expect(mockWriteFileSync).toHaveBeenCalledWith('test-path/report.json', 'formatted-report');
      expect(result).toBe('test-path/report.json');
    });

    it('should handle mkdirSync error gracefully', async () => {
      const writer = new FsWriter({ path: 'test-path' });
      mockMkdirSync.mockImplementation(() => {
        throw new Error('Directory exists');
      });

      const report: Report = {
        title: 'Test Report',
        environment: 'test',
        execution: { start_time: 0, end_time: 0, duration: 0, cumulative_duration: 0 },
        host_data: {
          framework: 'test',
          reporter: 'test',
          system: 'test',
          machineName: 'test',
          release: 'test',
          version: 'test',
          arch: 'test',
          node: 'test',
          npm: 'test',
          commons: 'test',
          apiClientV1: 'test',
          apiClientV2: 'test',
        },
        stats: { total: 0, passed: 0, failed: 0, skipped: 0, broken: 0, muted: 0 },
        results: [],
        threads: [],
        suites: [],
      };

      writer['formatter'].format = jest.fn().mockResolvedValue('formatted-report');

      await expect(writer.writeReport(report)).resolves.toBe('test-path/report.json');
    });
  });

  describe('writeTestResult', () => {
    it('should create results directory and write test result file', async () => {
      const writer = new FsWriter({ path: 'test-path', format: FormatEnum.json });
      const testResult = new TestResultType('Test Result');
      testResult.id = 'test-1';

      // Mock formatter
      writer['formatter'].format = jest.fn().mockResolvedValue('formatted-result');

      await writer.writeTestResult(testResult);

      expect(mockMkdirSync).toHaveBeenCalledWith('test-path/results', { recursive: true });
      expect(mockWriteFileSync).toHaveBeenCalledWith('test-path/results/test-1.json', 'formatted-result');
    });

    it('should handle mkdirSync error gracefully', async () => {
      const writer = new FsWriter({ path: 'test-path' });
      mockMkdirSync.mockImplementation(() => {
        throw new Error('Directory exists');
      });

      const testResult = new TestResultType('Test Result');
      testResult.id = 'test-1';

      writer['formatter'].format = jest.fn().mockResolvedValue('formatted-result');

      await expect(writer.writeTestResult(testResult)).resolves.toBeUndefined();
    });
  });

  describe('deleteFolderRecursive', () => {
    it('should recursively delete directory with files and subdirectories', () => {
      const writer = new FsWriter({ path: 'test-path' });
      
      mockExistsSync.mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockReaddirSync.mockReturnValue(['file1.txt', 'subdir', 'file2.txt'] as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockLstatSync.mockImplementation((path: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        isDirectory: () => path.includes('subdir'),
      } as any));

      // Mock recursive calls for subdirectory
      mockExistsSync
        .mockReturnValueOnce(true) // First call for main directory
        .mockReturnValueOnce(true); // Second call for subdirectory
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockReaddirSync
        .mockReturnValueOnce(['file1.txt', 'subdir', 'file2.txt'] as any) // First call
        .mockReturnValueOnce(['nested-file.txt'] as any); // Second call for subdirectory
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockLstatSync
        .mockReturnValueOnce({ isDirectory: () => false } as any) // file1.txt
        .mockReturnValueOnce({ isDirectory: () => true } as any) // subdir
        .mockReturnValueOnce({ isDirectory: () => false } as any) // file2.txt
        .mockReturnValueOnce({ isDirectory: () => false } as any); // nested-file.txt

      writer['deleteFolderRecursive']('test-path');

      expect(mockExistsSync).toHaveBeenCalledWith('test-path');
      expect(mockReaddirSync).toHaveBeenCalledWith('test-path');
      expect(mockUnlinkSync).toHaveBeenCalledWith('test-path/file1.txt');
      expect(mockUnlinkSync).toHaveBeenCalledWith('test-path/file2.txt');
      expect(mockUnlinkSync).toHaveBeenCalledWith('test-path/subdir/nested-file.txt');
      expect(mockRmdirSync).toHaveBeenCalledWith('test-path/subdir');
      expect(mockRmdirSync).toHaveBeenCalledWith('test-path');
    });

    it('should do nothing if directory does not exist', () => {
      const writer = new FsWriter({ path: 'test-path' });
      
      mockExistsSync.mockReturnValue(false);

      writer['deleteFolderRecursive']('non-existent-path');

      expect(mockExistsSync).toHaveBeenCalledWith('non-existent-path');
      expect(mockReaddirSync).not.toHaveBeenCalled();
      expect(mockUnlinkSync).not.toHaveBeenCalled();
      expect(mockRmdirSync).not.toHaveBeenCalled();
    });

    it('should handle empty directory', () => {
      const writer = new FsWriter({ path: 'test-path' });
      
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([]);

      writer['deleteFolderRecursive']('empty-dir');

      expect(mockExistsSync).toHaveBeenCalledWith('empty-dir');
      expect(mockReaddirSync).toHaveBeenCalledWith('empty-dir');
      expect(mockRmdirSync).toHaveBeenCalledWith('empty-dir');
    });
  });
}); 

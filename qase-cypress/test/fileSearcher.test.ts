/* eslint-disable */
import { expect } from '@jest/globals';
import { FileSearcher } from '../src/fileSearcher';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('FileSearcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.cwd
    Object.defineProperty(process, 'cwd', {
      value: jest.fn(() => '/mock/cwd'),
      writable: true,
    });
    
    // Mock path.resolve to return absolute path
    mockPath.resolve.mockImplementation((cwd, folder) => `${cwd}/${folder}`);
    
    // Mock path.join to return joined path
    mockPath.join.mockImplementation((...args) => args.join('/'));
  });

  describe('findFilesBeforeTime', () => {
    it('should return empty array when no matching folders found', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockReturnValue([]);

      const result = FileSearcher.findFilesBeforeTime('/screenshots', 'test.cy.js', new Date());

      expect(result).toEqual([]);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/cwd//screenshots');
    });

    it('should find files in matching folder', () => {
      const mockTime = new Date('2023-01-01T10:00:00Z');
      const fileTime = new Date('2023-01-01T11:00:00Z'); // After mockTime
      
      // Mock folder structure
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce([
          { name: 'test.cy.js', isDirectory: () => true, isFile: () => false },
        ] as any)
        .mockReturnValueOnce([
          { name: 'screenshot1.png', isDirectory: () => false, isFile: () => true },
          { name: 'screenshot2.png', isDirectory: () => false, isFile: () => true },
        ] as any);

      mockFs.statSync.mockReturnValue({
        birthtime: fileTime,
      } as any);

      const result = FileSearcher.findFilesBeforeTime('/screenshots', 'test.cy.js', mockTime);

      expect(result).toEqual([
        '/mock/cwd//screenshots/test.cy.js/screenshot1.png',
        '/mock/cwd//screenshots/test.cy.js/screenshot2.png',
      ]);
    });

    it('should skip files created before the specified time', () => {
      const mockTime = new Date('2023-01-01T11:00:00Z');
      const fileTime = new Date('2023-01-01T10:00:00Z'); // Before mockTime
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync
        .mockReturnValueOnce([
          { name: 'test.cy.js', isDirectory: () => true, isFile: () => false },
        ] as any)
        .mockReturnValueOnce([
          { name: 'screenshot.png', isDirectory: () => false, isFile: () => true },
        ] as any);

      mockFs.statSync.mockReturnValue({
        birthtime: fileTime,
      } as any);

      const result = FileSearcher.findFilesBeforeTime('/screenshots', 'test.cy.js', mockTime);

      expect(result).toEqual([]);
    });

    it('should handle non-existent directories gracefully', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = FileSearcher.findFilesBeforeTime('/non-existent', 'test.cy.js', new Date());

      expect(result).toEqual([]);
    });
  });
}); 

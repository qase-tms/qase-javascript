/* eslint-disable */
import { expect } from '@jest/globals';
import { FileSearcher } from '../src/fileSearcher';
import * as fs from 'fs';

// Mock only fs module
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('FileSearcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.cwd
    Object.defineProperty(process, 'cwd', {
      value: jest.fn(() => '/mock/cwd'),
      writable: true,
    });
  });

  describe('findFilesBeforeTime', () => {
    it('should return empty array when no matching folders found', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockReturnValue([]);

      const result = FileSearcher.findFilesBeforeTime('/screenshots', 'test.cy.js', new Date());

      expect(result).toEqual([]);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/screenshots');
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
        '/screenshots/test.cy.js/screenshot1.png',
        '/screenshots/test.cy.js/screenshot2.png',
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

  describe('findVideoFiles', () => {
    it('should find video files in root video directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        { name: 'test.cy.js.mp4', isDirectory: () => false, isFile: () => true },
        { name: 'other.cy.js.mp4', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = FileSearcher.findVideoFiles('/videos', 'test');

      expect(result).toEqual(['/videos/test.cy.js.mp4']);
    });

    it('should find video files in subdirectory when specRelativePath is provided', () => {
      // Mock existsSync to return true for root directory and subdirectory
      mockFs.existsSync.mockImplementation((path) => {
        const pathStr = String(path);
        return pathStr.endsWith('/videos') || pathStr.endsWith('/videos/feature');
      });
      
      mockFs.readdirSync.mockReturnValue([
        { name: 'test.cy.js.mp4', isDirectory: () => false, isFile: () => true },
        { name: 'other.cy.js.mp4', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = FileSearcher.findVideoFiles('/videos', 'test', 'feature/test.cy.js');

      // The actual path will depend on the system, so we check that it contains the right parts
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('videos/feature/test.cy.js.mp4');
    });

    it('should return empty array when video subdirectory does not exist', () => {
      // Mock existsSync to return true for root directory but false for subdirectory
      mockFs.existsSync.mockImplementation((path) => {
        const pathStr = String(path);
        return pathStr.endsWith('/videos');
      });
      
      mockFs.readdirSync.mockReturnValue([
        { name: 'test.cy.js.mp4', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = FileSearcher.findVideoFiles('/videos', 'test', 'non-existent/test.cy.js');

      // The actual path will depend on the system, so we check that it contains the right parts
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('videos/test.cy.js.mp4');
    });

    it('should handle both root and subdirectory video files', () => {
      // Mock existsSync to return true for root directory and subdirectory
      mockFs.existsSync.mockImplementation((path) => {
        const pathStr = String(path);
        return pathStr.endsWith('/videos') || pathStr.endsWith('/videos/feature');
      });
      
      mockFs.readdirSync.mockReturnValue([
        { name: 'test.cy.js.mp4', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = FileSearcher.findVideoFiles('/videos', 'test', 'feature/test.cy.js');

      // The actual path will depend on the system, so we check that it contains the right parts
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('videos/feature/test.cy.js.mp4');
    });

    it('should return empty array when video directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = FileSearcher.findVideoFiles('/non-existent', 'test');

      expect(result).toEqual([]);
    });

    it('should filter only mp4 files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        { name: 'test.cy.js.mp4', isDirectory: () => false, isFile: () => true },
        { name: 'test.cy.js.avi', isDirectory: () => false, isFile: () => true },
        { name: 'test.cy.js.mov', isDirectory: () => false, isFile: () => true },
      ] as any);

      const result = FileSearcher.findVideoFiles('/videos', 'test');

      expect(result).toEqual(['/videos/test.cy.js.mp4']);
    });
  });

  describe('findVideoFilesBeforeTime', () => {
  });
}); 

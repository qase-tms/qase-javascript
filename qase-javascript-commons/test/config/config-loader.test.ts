import { expect } from '@jest/globals';
import { ConfigLoader } from '../../src/config/config-loader';
import { QaseError } from '../../src/utils/qase-error';
import { JSONSchemaType } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('ConfigLoader', () => {
  const mockReadFileSync = jest.mocked(fs.readFileSync);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mockJoin = jest.mocked(path.join);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default paths', () => {
      const loader = new ConfigLoader();

      expect(loader).toBeInstanceOf(ConfigLoader);
    });

    it('should create instance with custom paths', () => {
      const customPaths = ['custom.config.json'];
      const loader = new ConfigLoader(undefined, customPaths);

      expect(loader).toBeInstanceOf(ConfigLoader);
    });
  });

  describe('load', () => {
    it('should load valid config from first path', () => {
      const validConfig = {
        projectCode: 'TEST',
        apiToken: 'token123',
      };
      const configJson = JSON.stringify(validConfig);

      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockReturnValue(configJson);

      const loader = new ConfigLoader();
      const result = loader.load();

      expect(result).toEqual(validConfig);
      expect(mockJoin).toHaveBeenCalledWith(process.cwd(), 'qase.config.json');
      expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/qase.config.json', 'utf8');
    });

    it('should try second path when first fails with ENOENT', () => {
      const validConfig = {
        projectCode: 'TEST',
        apiToken: 'token123',
      };
      const configJson = JSON.stringify(validConfig);

      // First path fails
      mockJoin
        .mockReturnValueOnce('/path/to/qase.config.json')
        .mockReturnValueOnce('/path/to/.qaserc');
      
      mockReadFileSync
        .mockImplementationOnce(() => {
          const error = new Error('File not found') as NodeJS.ErrnoException;
          error.code = 'ENOENT';
          throw error;
        })
        .mockReturnValueOnce(configJson);

      const loader = new ConfigLoader();
      const result = loader.load();

      expect(result).toEqual(validConfig);
      expect(mockJoin).toHaveBeenCalledTimes(2);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it('should return null when no config files exist', () => {
      mockJoin
        .mockReturnValueOnce('/path/to/qase.config.json')
        .mockReturnValueOnce('/path/to/.qaserc');
      
      mockReadFileSync
        .mockImplementation(() => {
          const error = new Error('File not found') as NodeJS.ErrnoException;
          error.code = 'ENOENT';
          throw error;
        });

      const loader = new ConfigLoader();
      const result = loader.load();

      expect(result).toBeNull();
    });

    it('should throw QaseError for non-ENOENT file system errors', () => {
      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockImplementation(() => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        throw error;
      });

      const loader = new ConfigLoader();

      expect(() => loader.load()).toThrow(QaseError);
    });

    it('should throw error for invalid JSON', () => {
      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockReturnValue('invalid json');

      const loader = new ConfigLoader();

      expect(() => loader.load()).toThrow(SyntaxError);
    });

    it('should throw error for validation failures', () => {
      const invalidConfig = {
        testops: {
          api: {
            token: 123, // Should be string, not number
          },
        },
      };
      const configJson = JSON.stringify(invalidConfig);

      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockReturnValue(configJson);

      const loader = new ConfigLoader();
      expect(() => loader.load()).toThrow('Invalid config: "`testops.api/token`" must be string');
    });

    it('should handle EISDIR error code', () => {
      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockImplementation(() => {
        const error = new Error('Is a directory') as NodeJS.ErrnoException;
        error.code = 'EISDIR';
        throw error;
      });

      const loader = new ConfigLoader();
      const result = loader.load();

      expect(result).toBeNull();
    });
  });

  describe('with custom validation schema', () => {
    it('should use custom schema for validation', () => {
      const customSchema: JSONSchemaType<{ customField: string }> = {
        type: 'object',
        properties: {
          customField: { type: 'string' },
        },
        required: ['customField'],
      };

      const validCustomConfig = {
        customField: 'custom value',
      };
      const configJson = JSON.stringify(validCustomConfig);

      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockReturnValue(configJson);

      const loader = new ConfigLoader(customSchema);
      const result = loader.load();

      expect(result).toEqual(validCustomConfig);
    });

    it('should throw error for invalid custom schema', () => {
      const customSchema: JSONSchemaType<{ customField: string }> = {
        type: 'object',
        properties: {
          customField: { type: 'string' },
        },
        required: ['customField'],
      };

      const invalidCustomConfig = {
        // Missing required customField
      };
      const configJson = JSON.stringify(invalidCustomConfig);

      mockJoin.mockReturnValue('/path/to/qase.config.json');
      mockReadFileSync.mockReturnValue(configJson);

      const loader = new ConfigLoader(customSchema);
      expect(() => loader.load()).toThrow('Invalid config: "it" must have required property \'customField\'');
    });
  });
}); 

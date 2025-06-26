import { expect } from '@jest/globals';
import { JsonpFormatter } from '../../src/formatter/jsonp-formatter';

// Mock strip-ansi
jest.mock('strip-ansi', () => ({
  __esModule: true,
  default: jest.fn((str: string) => str.replace(/\u001b\[\d+m/g, '')),
}));

describe('JsonpFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const formatter = new JsonpFormatter();

      expect(formatter).toBeInstanceOf(JsonpFormatter);
    });

    it('should create instance with custom space option', () => {
      const formatter = new JsonpFormatter({ space: 2 });

      expect(formatter).toBeInstanceOf(JsonpFormatter);
    });
  });

  describe('format', () => {
    it('should format simple object with qaseJsonp wrapper', async () => {
      const formatter = new JsonpFormatter();
      const testObject = { name: 'test', value: 123 };

      const result = await formatter.format(testObject);

      const expectedJson = JSON.stringify(testObject, null, 4);
      expect(result).toBe(`qaseJsonp(${expectedJson});`);
    });

    it('should format object with custom spacing', async () => {
      const formatter = new JsonpFormatter({ space: 2 });
      const testObject = { name: 'test', value: 123 };

      const result = await formatter.format(testObject);

      const expectedJson = JSON.stringify(testObject, null, 2);
      expect(result).toBe(`qaseJsonp(${expectedJson});`);
    });

    it('should strip ANSI codes from Error objects in error property', async () => {
      const formatter = new JsonpFormatter();
      const error = new Error('\u001b[31mError message\u001b[0m');
      const testObject = { name: 'test', error };

      const result = await formatter.format(testObject);

      expect(result).toContain('"error": "Error: Error message"');
      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
    });

    it('should not strip ANSI codes from non-error properties', async () => {
      const formatter = new JsonpFormatter();
      const testObject = { 
        name: 'test', 
        message: '\u001b[31mColored message\u001b[0m' 
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"message": "\\u001b[31mColored message\\u001b[0m"');
      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
    });

    it('should handle nested objects with errors', async () => {
      const formatter = new JsonpFormatter();
      const error = new Error('Nested error');
      const testObject = {
        level1: {
          level2: {
            error,
            data: 'some data'
          }
        }
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"error": "Error: Nested error"');
      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
    });

    it('should handle arrays with errors', async () => {
      const formatter = new JsonpFormatter();
      const error = new Error('Array error');
      const testObject = {
        items: [
          { name: 'item1' },
          { error },
          { name: 'item3' }
        ]
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"error": "Error: Array error"');
      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
    });

    it('should handle null and undefined values', async () => {
      const formatter = new JsonpFormatter();
      const testObject = {
        nullValue: null,
        undefinedValue: undefined,
        stringValue: 'test'
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"nullValue": null');
      expect(result).toContain('"stringValue": "test"');
      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
    });

    it('should handle empty object', async () => {
      const formatter = new JsonpFormatter();
      const testObject = {};

      const result = await formatter.format(testObject);

      expect(result).toBe('qaseJsonp({});');
    });

    it('should handle primitive values', async () => {
      const formatter = new JsonpFormatter();

      expect(await formatter.format('string')).toBe('qaseJsonp("string");');
      expect(await formatter.format(123)).toBe('qaseJsonp(123);');
      expect(await formatter.format(true)).toBe('qaseJsonp(true);');
      expect(await formatter.format(null)).toBe('qaseJsonp(null);');
    });

    it('should ensure proper JSONP format with semicolon', async () => {
      const formatter = new JsonpFormatter();
      const testObject = { data: 'test' };

      const result = await formatter.format(testObject);

      expect(result).toMatch(/^qaseJsonp\([\s\S]*\);$/);
      expect(result.endsWith(';')).toBe(true);
    });
  });
}); 

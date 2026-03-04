import { expect } from '@jest/globals';
import { JsonFormatter } from '../../src/formatter/json-formatter';

// Mock strip-ansi
jest.mock('strip-ansi', () => ({
  __esModule: true,
  // eslint-disable-next-line no-control-regex
  default: jest.fn((str: string) => str.replace(/\u001b\[\d+m/g, '')),
}));

describe('JsonFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const formatter = new JsonFormatter();

      expect(formatter).toBeInstanceOf(JsonFormatter);
    });

    it('should create instance with custom space option', () => {
      const formatter = new JsonFormatter({ space: 2 });

      expect(formatter).toBeInstanceOf(JsonFormatter);
    });
  });

  describe('format', () => {
    it('should format simple object with default spacing', async () => {
      const formatter = new JsonFormatter();
      const testObject = { name: 'test', value: 123 };

      const result = await formatter.format(testObject);

      expect(result).toBe(JSON.stringify(testObject, null, 4));
    });

    it('should format object with custom spacing', async () => {
      const formatter = new JsonFormatter({ space: 2 });
      const testObject = { name: 'test', value: 123 };

      const result = await formatter.format(testObject);

      expect(result).toBe(JSON.stringify(testObject, null, 2));
    });

    it('should strip ANSI codes from Error objects in error property', async () => {
      const formatter = new JsonFormatter();
      const error = new Error('\u001b[31mError message\u001b[0m');
      const testObject = { name: 'test', error };

      const result = await formatter.format(testObject);

      expect(result).toContain('"error": "Error: Error message"');
    });

    it('should not strip ANSI codes from non-error properties', async () => {
      const formatter = new JsonFormatter();
      const testObject = { 
        name: 'test', 
        message: '\u001b[31mColored message\u001b[0m' 
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"message": "\\u001b[31mColored message\\u001b[0m"');
    });

    it('should handle nested objects with errors', async () => {
      const formatter = new JsonFormatter();
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
    });

    it('should handle arrays with errors', async () => {
      const formatter = new JsonFormatter();
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
    });

    it('should handle null and undefined values', async () => {
      const formatter = new JsonFormatter();
      const testObject = {
        nullValue: null,
        undefinedValue: undefined,
        stringValue: 'test'
      };

      const result = await formatter.format(testObject);

      expect(result).toContain('"nullValue": null');
      expect(result).toContain('"stringValue": "test"');
      // undefined values are omitted in JSON.stringify
    });

    it('should handle empty object', async () => {
      const formatter = new JsonFormatter();
      const testObject = {};

      const result = await formatter.format(testObject);

      expect(result).toBe('{}');
    });

    it('should handle primitive values', async () => {
      const formatter = new JsonFormatter();

      expect(await formatter.format('string')).toBe('"string"');
      expect(await formatter.format(123)).toBe('123');
      expect(await formatter.format(true)).toBe('true');
      expect(await formatter.format(null)).toBe('null');
    });
  });
}); 

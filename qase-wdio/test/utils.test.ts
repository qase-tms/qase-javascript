/* eslint-disable */
import { expect } from '@jest/globals';
import { isEmpty, isScreenshotCommand } from '../src/utils';

describe('utils', () => {
  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for object with properties', () => {
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return false for array with elements', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('should return true for numbers (not objects)', () => {
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty(42)).toBe(true);
    });

    it('should return true for booleans (not objects)', () => {
      expect(isEmpty(false)).toBe(true);
      expect(isEmpty(true)).toBe(true);
    });
  });

  describe('isScreenshotCommand', () => {
    it('should return true for WebDriver screenshot endpoint', () => {
      const command = {
        sessionId: 'abc123',
        endpoint: '/session/abc123/screenshot',
        method: 'GET',
        body: {},
      };

      expect(isScreenshotCommand(command)).toBe(true);
    });

    it('should return true for WebDriver element screenshot endpoint', () => {
      const command = {
        sessionId: 'abc123',
        endpoint: '/session/abc123/element/def456/screenshot',
        method: 'GET',
        body: {},
      };

      expect(isScreenshotCommand(command)).toBe(true);
    });

    it('should return true for DevTools takeScreenshot command', () => {
      const command = {
        sessionId: 'abc123',
        command: 'takeScreenshot',
        params: {},
      };

      expect(isScreenshotCommand(command)).toBe(true);
    });

    it('should return false for non-screenshot WebDriver endpoint', () => {
      const command = {
        sessionId: 'abc123',
        endpoint: '/session/abc123/element',
        method: 'POST',
        body: { using: 'id', value: 'test' },
      };

      expect(isScreenshotCommand(command)).toBe(false);
    });

    it('should return false for other DevTools command', () => {
      const command = {
        sessionId: 'abc123',
        command: 'getPageSource',
        params: {},
      };

      expect(isScreenshotCommand(command)).toBe(false);
    });

    it('should return false for command without endpoint and command', () => {
      const command = {
        sessionId: 'abc123',
        method: 'GET',
        body: {},
      };

      expect(isScreenshotCommand(command)).toBe(false);
    });

    it('should handle complex session IDs in endpoint', () => {
      const command = {
        sessionId: 'abc-123-def_456',
        endpoint: '/session/abc-123-def_456/screenshot',
        method: 'GET',
        body: {},
      };

      expect(isScreenshotCommand(command)).toBe(true);
    });

    it('should handle complex element IDs in endpoint', () => {
      const command = {
        sessionId: 'abc123',
        endpoint: '/session/abc123/element/def-456-ghi_789/screenshot',
        method: 'GET',
        body: {},
      };

      expect(isScreenshotCommand(command)).toBe(true);
    });
  });
}); 

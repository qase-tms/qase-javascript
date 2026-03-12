/* eslint-disable */
import { expect } from '@jest/globals';
import { qase } from '../src/mocha';
import { Test } from 'mocha';

describe('qase()', () => {
  describe('string test argument', () => {
    it('should return formatted string with single case ID', () => {
      const result = qase(1, 'Test title');
      expect(result).toBe('Test title (Qase ID: 1)');
    });

    it('should return formatted string with multiple case IDs', () => {
      const result = qase([1, 2, 3], 'Test title');
      expect(result).toBe('Test title (Qase ID: 1,2,3)');
    });

    it('should handle string case IDs', () => {
      const result = qase('42', 'Test title');
      expect(result).toBe('Test title (Qase ID: 42)');
    });
  });

  describe('Test object argument', () => {
    it('should modify test.title with case ID', () => {
      const test = { title: 'Test title' } as Test;
      const result = qase(1, test);
      expect((result as Test).title).toBe('Test title (Qase ID: 1)');
    });

    it('should modify test.title with multiple case IDs', () => {
      const test = { title: 'Test title' } as Test;
      const result = qase([1, 2], test);
      expect((result as Test).title).toBe('Test title (Qase ID: 1,2)');
    });
  });

  describe('@cypress/grep compatibility', () => {
    it('should return undefined when test is undefined', () => {
      const result = qase(1, undefined as unknown as Test);
      expect(result).toBeUndefined();
    });

    it('should return null when test is null', () => {
      const result = qase(1, null as unknown as Test);
      expect(result).toBeNull();
    });
  });
});

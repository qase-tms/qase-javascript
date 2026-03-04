import { describe, it, expect } from '@jest/globals';
import { addQaseId, addQaseProjects } from '../src/vitest';

describe('vitest.ts - Main functions', () => {
  describe('addQaseId', () => {
    it('should add Qase ID to test name', () => {
      const name = 'Test Name';
      const caseIds = [123, 456];
      const result = addQaseId(name, caseIds);
      expect(result).toBe('Test Name (Qase ID: 123,456)');
    });

    it('should handle single Qase ID', () => {
      const name = 'Single Test';
      const caseIds = [789];
      const result = addQaseId(name, caseIds);
      expect(result).toBe('Single Test (Qase ID: 789)');
    });

    it('should handle empty array of Qase IDs', () => {
      const name = 'Empty Test';
      const caseIds: number[] = [];
      const result = addQaseId(name, caseIds);
      expect(result).toBe('Empty Test (Qase ID: )');
    });

    it('should handle special characters in name', () => {
      const name = 'Test with special chars: !@#$%^&*()';
      const caseIds = [123];
      const result = addQaseId(name, caseIds);
      expect(result).toBe('Test with special chars: !@#$%^&*() (Qase ID: 123)');
    });
  });

  describe('addQaseProjects', () => {
    it('should add multi-project markers to test name', () => {
      const name = 'Login flow';
      const mapping = { PROJ1: [100], PROJ2: [200] };
      const result = addQaseProjects(name, mapping);
      expect(result).toBe('Login flow (Qase PROJ1: 100) (Qase PROJ2: 200)');
    });

    it('should handle multiple IDs per project', () => {
      const name = 'Checkout';
      const mapping = { PROJ1: [10, 11], PROJ2: [20] };
      const result = addQaseProjects(name, mapping);
      expect(result).toBe('Checkout (Qase PROJ1: 10,11) (Qase PROJ2: 20)');
    });
  });

  describe('withQase', () => {
    it('should be a function', () => {
      const { withQase } = require('../src/vitest');
      expect(typeof withQase).toBe('function');
    });

    it('should return a function', () => {
      const { withQase } = require('../src/vitest');
      const testFn = () => {};
      const wrappedFn = withQase(testFn);
      expect(typeof wrappedFn).toBe('function');
    });
  });

  describe('Exports', () => {
    it('should export addQaseId', () => {
      const { addQaseId } = require('../src/vitest');
      expect(typeof addQaseId).toBe('function');
    });

    it('should export addQaseProjects', () => {
      const { addQaseProjects } = require('../src/vitest');
      expect(typeof addQaseProjects).toBe('function');
    });

    it('should export withQase', () => {
      const { withQase } = require('../src/vitest');
      expect(typeof withQase).toBe('function');
    });
  });
});

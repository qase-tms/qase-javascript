/* eslint-disable */
import { expect } from '@jest/globals';
import { extractTags } from '../src/utils/tagParser';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('tagParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTags', () => {
    it('should extract tags for a scenario', () => {
      const fileContent = `
@feature-tag
@another-tag
Feature: Test Feature

@scenario-tag1 @scenario-tag2
Scenario: Test Scenario
  Given some step
  When another step
  Then final step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual(['@scenario-tag1', '@scenario-tag2']);
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/feature.feature', 'utf-8');
    });

    it('should return empty array when scenario not found', () => {
      const fileContent = `
@feature-tag
Feature: Test Feature

Scenario: Different Scenario
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual([]);
    });

    it('should return empty array when no tags found for scenario', () => {
      const fileContent = `
@feature-tag
Feature: Test Feature

Scenario: Test Scenario
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual([]);
    });

    it('should handle multiple tags on separate lines', () => {
      const fileContent = `
@feature-tag
Feature: Test Feature

@tag1
@tag2
@tag3
Scenario: Test Scenario
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual(['@tag3']);
    });

    it('should stop searching at empty line', () => {
      const fileContent = `
@feature-tag
Feature: Test Feature

@ignored-tag

@scenario-tag
Scenario: Test Scenario
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual(['@scenario-tag']);
    });

    it('should stop searching at Feature line', () => {
      const fileContent = `
@feature-tag
Feature: Test Feature

@scenario-tag
Scenario: Test Scenario
  Given some step

Feature: Another Feature
@ignored-tag
Scenario: Another Scenario
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual(['@scenario-tag']);
    });

    it('should handle scenario with exact name match', () => {
      const fileContent = `
Feature: Test Feature

@tag1 @tag2
Scenario: Exact Match Scenario
  Given some step

@tag3
Scenario: Exact Match Scenario
  Given another step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Exact Match Scenario');

      expect(result).toEqual(['@tag1', '@tag2']);
    });

    it('should handle file with only whitespace', () => {
      const fileContent = '   \n  \n  ';

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual([]);
    });

    it('should handle scenario with special characters in name', () => {
      const fileContent = `
Feature: Test Feature

@tag1
Scenario: Test Scenario (with parentheses)
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario (with parentheses)');

      expect(result).toEqual(['@tag1']);
    });

    it('should handle tags with special characters', () => {
      const fileContent = `
Feature: Test Feature

@tag-with-dashes @tag_with_underscores @tag123
Scenario: Test Scenario
  Given some step
`;

      mockFs.readFileSync.mockReturnValue(fileContent);

      const result = extractTags('/path/to/feature.feature', 'Test Scenario');

      expect(result).toEqual(['@tag-with-dashes', '@tag_with_underscores', '@tag123']);
    });
  });
}); 

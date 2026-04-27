import { describe, expect, it } from '@jest/globals';
import { extractAndCleanStep } from '../../src/internal/step-parser';

describe('extractAndCleanStep', () => {
  it('returns nulls and original string when no markers are present', () => {
    expect(extractAndCleanStep('do something')).toEqual({
      expectedResult: null,
      data: null,
      cleanedString: 'do something',
    });
  });

  it('extracts both expected result and data', () => {
    const result = extractAndCleanStep('click button QaseExpRes: button is highlighted QaseData: blue');
    expect(result.expectedResult).toBe('button is highlighted');
    expect(result.data).toBe('blue');
    expect(result.cleanedString).toBe('click button');
  });

  it('handles double-colon variant', () => {
    const result = extractAndCleanStep('step QaseExpRes:: yes QaseData:: data');
    expect(result.expectedResult).toBe('yes');
    expect(result.data).toBe('data');
    expect(result.cleanedString).toBe('step');
  });

  it('returns nulls for empty input', () => {
    expect(extractAndCleanStep('')).toEqual({
      expectedResult: null,
      data: null,
      cleanedString: '',
    });
  });
});

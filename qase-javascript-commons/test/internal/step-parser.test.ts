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

  it('extracts a multiline expected result and strips the markers', () => {
    const input = 'Verify Booking response schema QaseExpRes:: Response body should contain:\n'
      + '          - firstname: string\n'
      + '          - lastname: string QaseData:';

    const result = extractAndCleanStep(input);
    expect(result.expectedResult).toBe('Response body should contain:\n'
      + '          - firstname: string\n'
      + '          - lastname: string');
    expect(result.data).toBe(null);
    expect(result.cleanedString).toBe('Verify Booking response schema');
  });

  it('extracts multiline expected result and multiline data', () => {
    const result = extractAndCleanStep('send request QaseExpRes:: line1\nline2 QaseData:: key: 1\nkey2: 2');
    expect(result.expectedResult).toBe('line1\nline2');
    expect(result.data).toBe('key: 1\nkey2: 2');
    expect(result.cleanedString).toBe('send request');
  });

  it('strips the markers when only the expected result marker is present', () => {
    const result = extractAndCleanStep('step QaseExpRes:: multi\nline expected');
    expect(result.expectedResult).toBe('multi\nline expected');
    expect(result.data).toBe(null);
    expect(result.cleanedString).toBe('step');
  });

  it('strips the markers when only the data marker is present', () => {
    const result = extractAndCleanStep('step QaseData:: multi\nline data');
    expect(result.expectedResult).toBe(null);
    expect(result.data).toBe('multi\nline data');
    expect(result.cleanedString).toBe('step');
  });

  it('keeps a multiline action intact', () => {
    const result = extractAndCleanStep('given a\nmultiline action QaseExpRes:: ok QaseData:: d');
    expect(result.expectedResult).toBe('ok');
    expect(result.data).toBe('d');
    expect(result.cleanedString).toBe('given a\nmultiline action');
  });

  it('returns nulls for empty input', () => {
    expect(extractAndCleanStep('')).toEqual({
      expectedResult: null,
      data: null,
      cleanedString: '',
    });
  });
});

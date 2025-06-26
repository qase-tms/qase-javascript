import { expect } from '@jest/globals';
import { isAxiosError } from '../../src/utils/is-axios-error';
import { AxiosError } from 'axios';

describe('isAxiosError', () => {
  it('should return true for AxiosError instance', () => {
    const axiosError = new AxiosError('Network error', 'NETWORK_ERROR');

    const result = isAxiosError(axiosError);

    expect(result).toBe(true);
  });

  it('should return false for regular Error', () => {
    const regularError = new Error('Regular error');

    const result = isAxiosError(regularError);

    expect(result).toBe(false);
  });

  it('should return false for Error without isAxiosError property', () => {
    const error = new Error('Some error');
    // Explicitly remove isAxiosError property if it exists
    delete (error as any).isAxiosError;

    const result = isAxiosError(error);

    expect(result).toBe(false);
  });

  it('should return false for Error with falsy isAxiosError property', () => {
    const error = new Error('Some error');
    (error as any).isAxiosError = false;

    const result = isAxiosError(error);

    expect(result).toBe(false);
  });

  it('should return false for non-Error objects', () => {
    const nonError = { message: 'Not an error' };

    const result = isAxiosError(nonError);

    expect(result).toBe(false);
  });

  it('should return false for null', () => {
    const result = isAxiosError(null);

    expect(result).toBe(false);
  });

  it('should return false for undefined', () => {
    const result = isAxiosError(undefined);

    expect(result).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isAxiosError('string')).toBe(false);
    expect(isAxiosError(123)).toBe(false);
    expect(isAxiosError(true)).toBe(false);
    expect(isAxiosError({})).toBe(false);
  });
}); 

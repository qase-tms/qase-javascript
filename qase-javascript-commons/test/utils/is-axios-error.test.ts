import { expect } from '@jest/globals';
import { isAxiosError } from '../../src/utils/is-axios-error';

describe('isAxiosError', () => {
  it('should return true for axios error', () => {
    const axiosError = new Error('Axios error') as Error & { isAxiosError: boolean };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (axiosError as any).isAxiosError = true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (axiosError as any).response = { status: 404 };

    const result = isAxiosError(axiosError);

    expect(result).toBe(true);
  });

  it('should return false for non-axios error', () => {
    const regularError = new Error('Regular error');

    const result = isAxiosError(regularError);

    expect(result).toBe(false);
  });

  it('should return false for regular Error', () => {
    const regularError = new Error('Regular error');

    const result = isAxiosError(regularError);

    expect(result).toBe(false);
  });

  it('should return false for Error without isAxiosError property', () => {
    const error = new Error('Some error');
    // Explicitly remove isAxiosError property if it exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (error as any).isAxiosError;

    const result = isAxiosError(error);

    expect(result).toBe(false);
  });

  it('should return false for Error with falsy isAxiosError property', () => {
    const error = new Error('Some error');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

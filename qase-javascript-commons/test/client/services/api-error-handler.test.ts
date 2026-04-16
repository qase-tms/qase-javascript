/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { expect } from '@jest/globals';
import { processError, getErrorMessage } from '../../../src/client/services/api-error-handler';

describe('api-error-handler', () => {
  describe('processError', () => {
    it('should return QaseError with "Unauthorized" message for 401', () => {
      const error = createAxiosError(401, {});
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message: Unauthorized. Please check your API token.');
    });

    it('should return QaseError with errorMessage from response for 403', () => {
      const error = createAxiosError(403, { errorMessage: 'Access denied' });
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message: Access denied');
    });

    it('should return QaseError with "Forbidden" fallback for 403 without errorMessage', () => {
      const error = createAxiosError(403, {});
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message: Forbidden');
    });

    it('should return QaseError with "Not found" for 404', () => {
      const error = createAxiosError(404, {});
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message: Not found.');
    });

    it('should return QaseError with JSON body for 400', () => {
      const errorData = { field: 'invalid' };
      const error = createAxiosError(400, errorData);
      const result = processError(error, 'Test message', { some: 'model' });
      expect(result.message).toContain('Bad request');
      expect(result.message).toContain(JSON.stringify(errorData));
    });

    it('should return QaseError with JSON body for 422', () => {
      const errorData = { field: 'unprocessable' };
      const error = createAxiosError(422, errorData);
      const result = processError(error, 'Test message');
      expect(result.message).toContain('Bad request');
    });

    it('should return QaseError with cause for unknown status codes', () => {
      const error = createAxiosError(500, {});
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message');
      expect(result.cause).toBe(error);
    });

    it('should return QaseError with cause for non-axios errors', () => {
      const error = new Error('Something broke');
      const result = processError(error, 'Test message');
      expect(result.message).toBe('Test message');
      expect(result.cause).toBe(error);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract errorMessage from axios error response', () => {
      const error = createAxiosError(400, { errorMessage: 'Bad input' });
      expect(getErrorMessage(error)).toBe('Bad input');
    });

    it('should fall back to error field', () => {
      const error = createAxiosError(400, { error: 'Some error' });
      expect(getErrorMessage(error)).toBe('Some error');
    });

    it('should fall back to message field', () => {
      const error = createAxiosError(400, { message: 'A message' });
      expect(getErrorMessage(error)).toBe('A message');
    });

    it('should return "Unknown API error" when no fields match', () => {
      const error = createAxiosError(400, {});
      expect(getErrorMessage(error)).toBe('Unknown API error');
    });

    it('should return error.message for regular Error', () => {
      expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
    });

    it('should return "Unknown error" for non-Error values', () => {
      expect(getErrorMessage('string error')).toBe('Unknown error');
    });
  });
});

function createAxiosError(status: number, data: Record<string, unknown>): any {
  const error: any = new Error('axios error');
  error.isAxiosError = true;
  error.response = { status, data, headers: {} };
  return error;
}

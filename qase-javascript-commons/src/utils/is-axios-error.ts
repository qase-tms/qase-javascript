import { AxiosError } from 'axios';

/**
 * @param error
 * @returns {error is AxiosError}
 */
export const isAxiosError = (error: unknown): error is AxiosError =>
  error instanceof Error
  && 'isAxiosError' in error
  && Boolean(error.isAxiosError);

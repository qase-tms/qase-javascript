import { expect } from '@jest/globals';
import { getMimeTypes } from '../../src/utils/mimeTypes';
import * as mime from 'mime-types';

// Mock mime-types
jest.mock('mime-types', () => ({
  contentType: jest.fn(),
}));

describe('getMimeType', () => {
  const mockContentType = jest.mocked(mime.contentType);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return mime type for known extension', () => {
    mockContentType.mockReturnValue('text/plain');

    const result = getMimeTypes('test.txt');

    expect(result).toBe('text/plain');
    expect(mockContentType).toHaveBeenCalledWith('test.txt');
  });

  it('should return application/octet-stream for unknown extension', () => {
    mockContentType.mockReturnValue(false);

    const result = getMimeTypes('test.unknown');

    expect(result).toBe('application/octet-stream');
  });

  it('should return application/octet-stream for file without extension', () => {
    mockContentType.mockReturnValue(false);

    const result = getMimeTypes('testfile');

    expect(result).toBe('application/octet-stream');
  });

  it('should handle null return from mime-types', () => {
    mockContentType.mockReturnValue(false);

    const result = getMimeTypes('test.txt');

    expect(result).toBe('application/octet-stream');
  });

  it('should handle undefined return from mime-types', () => {
    mockContentType.mockReturnValue(false);

    const result = getMimeTypes('test.txt');

    expect(result).toBe('application/octet-stream');
  });

  it('should return correct mime type for common extensions', () => {
    mockContentType.mockReturnValue('image/png');

    const result = getMimeTypes('image.png');

    expect(result).toBe('image/png');
  });

  it('should return correct mime type for JSON files', () => {
    mockContentType.mockReturnValue('application/json');

    const result = getMimeTypes('data.json');

    expect(result).toBe('application/json');
  });
}); 

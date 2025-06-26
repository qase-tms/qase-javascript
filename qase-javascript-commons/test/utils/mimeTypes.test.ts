import { expect } from '@jest/globals';
import { getMimeTypes } from '../../src/utils/mimeTypes';

// Mock mime-types module
jest.mock('mime-types', () => ({
  contentType: jest.fn(),
}));

describe('getMimeTypes', () => {
  const mockContentType = require('mime-types').contentType;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct mime type for known file extension', () => {
    mockContentType.mockReturnValue('text/plain');

    const result = getMimeTypes('/path/to/file.txt');

    expect(result).toBe('text/plain');
    expect(mockContentType).toHaveBeenCalledWith('file.txt');
  });

  it('should return application/octet-stream for unknown file extension', () => {
    mockContentType.mockReturnValue(false);

    const result = getMimeTypes('/path/to/file.unknown');

    expect(result).toBe('application/octet-stream');
    expect(mockContentType).toHaveBeenCalledWith('file.unknown');
  });

  it('should return application/octet-stream when mime type is null', () => {
    mockContentType.mockReturnValue(null);

    const result = getMimeTypes('/path/to/file.txt');

    expect(result).toBe('application/octet-stream');
  });

  it('should return empty string when mime type is empty string', () => {
    mockContentType.mockReturnValue('');

    const result = getMimeTypes('/path/to/file.txt');

    expect(result).toBe('');
  });

  it('should handle files without extension', () => {
    mockContentType.mockReturnValue('application/octet-stream');

    const result = getMimeTypes('/path/to/file');

    expect(result).toBe('application/octet-stream');
    expect(mockContentType).toHaveBeenCalledWith('file');
  });

  it('should handle files with multiple dots', () => {
    mockContentType.mockReturnValue('application/json');

    const result = getMimeTypes('/path/to/file.config.json');

    expect(result).toBe('application/json');
    expect(mockContentType).toHaveBeenCalledWith('file.config.json');
  });

  it('should handle files with spaces in name', () => {
    mockContentType.mockReturnValue('image/jpeg');

    const result = getMimeTypes('/path/to/my file.jpg');

    expect(result).toBe('image/jpeg');
    expect(mockContentType).toHaveBeenCalledWith('my file.jpg');
  });
}); 

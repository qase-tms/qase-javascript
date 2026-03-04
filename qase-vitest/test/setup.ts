// Test setup file
import { jest } from '@jest/globals';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock Buffer for tests
global.Buffer = Buffer;

// Mock TextDecoder
global.TextDecoder = TextDecoder;

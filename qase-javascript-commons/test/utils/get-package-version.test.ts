import { expect } from '@jest/globals';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

// Mock require.resolve
const mockRequireResolve = jest.fn();
jest.doMock('module', () => ({
  createRequire: () => ({
    resolve: mockRequireResolve,
  }),
}));

describe('getPackageVersion', () => {
  const mockReadFileSync = require('fs').readFileSync;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined when package.json does not exist', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    mockRequireResolve.mockImplementation(() => {
      throw new Error('Cannot find module');
    });

    const result = getPackageVersion('non-existent-package');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json has no version field', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    const mockPackageJson = JSON.stringify({ name: 'test-package' });
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue(mockPackageJson);

    const result = getPackageVersion('test-package');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json is invalid JSON', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue('invalid json');

    const result = getPackageVersion('test-package');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json version is not a string', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    const mockPackageJson = JSON.stringify({ version: 123 });
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue(mockPackageJson);

    const result = getPackageVersion('test-package');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json is null', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    const mockPackageJson = JSON.stringify(null);
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue(mockPackageJson);

    const result = getPackageVersion('test-package');

    expect(result).toBeUndefined();
  });
}); 

import { expect } from '@jest/globals';
import { getPackageVersion } from '../../src/utils/get-package-version';
import * as fs from 'fs';

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
  const mockReadFileSync = jest.mocked(fs.readFileSync);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return version from package.json', () => {
    const packageJson = {
      name: 'test-package',
      version: '1.2.3',
    };

    mockReadFileSync.mockReturnValue(JSON.stringify(packageJson));

    const version = getPackageVersion('qase-javascript-commons');

    expect(version).toBe('1.2.3');
    expect(mockReadFileSync).toHaveBeenCalledWith(expect.stringContaining('package.json'), 'utf8');
  });

  it('should return undefined when package.json is not found', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const version = getPackageVersion('qase-javascript-commons');

    expect(version).toBeUndefined();
  });

  it('should return undefined when package.json is invalid JSON', () => {
    mockReadFileSync.mockReturnValue('invalid json');

    const version = getPackageVersion('qase-javascript-commons');

    expect(version).toBeUndefined();
  });

  it('should return undefined when package.json has no version field', () => {
    const packageJson = {
      name: 'test-package',
      // no version field
    };

    mockReadFileSync.mockReturnValue(JSON.stringify(packageJson));

    const version = getPackageVersion('qase-javascript-commons');

    expect(version).toBeUndefined();
  });

  it('should return undefined when package.json does not exist', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    mockRequireResolve.mockImplementation(() => {
      throw new Error('Cannot find module');
    });

    const result = getPackageVersion('qase-javascript-commons');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json has no version field', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    const mockPackageJson = JSON.stringify({ name: 'test-package' });
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue(mockPackageJson);

    const result = getPackageVersion('qase-javascript-commons');

    expect(result).toBeUndefined();
  });

  it('should return undefined when package.json is invalid JSON', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue('invalid json');

    const result = getPackageVersion('qase-javascript-commons');

    expect(result).toBeUndefined();
  });

  it('should return string version when package.json version is not a string', async () => {
    const { getPackageVersion } = await import('../../src/utils/get-package-version');
    
    const mockPackageJson = JSON.stringify({ name: 'test-package', version: 123 });
    mockRequireResolve.mockReturnValue('/path/to/package.json');
    mockReadFileSync.mockReturnValue(mockPackageJson);

    const result = getPackageVersion('qase-javascript-commons');

    expect(result).toBe('123');
  });
}); 

import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { HostData } from '../models/host-data';
import { execSync } from "child_process";

interface PackageJson {
  version: string;

  [key: string]: unknown;
}

interface PackageInfo {
  version?: string;
  resolved?: string;
  overridden?: boolean;
  dependencies?: Record<string, PackageInfo>;

  [key: string]: unknown;
}

interface NpmListResult {
  version?: string;
  name?: string;
  dependencies?: Record<string, PackageInfo>;
}

/**
 * Gets detailed OS information based on the platform
 * @returns {string} Detailed OS information
 */
function getDetailedOSInfo(): string {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      // Windows
      return cp.execSync('ver').toString().trim();
    } else if (platform === 'darwin') {
      // macOS
      return cp.execSync('sw_vers -productVersion').toString().trim();
    } else {
      // Linux and others
      try {
        const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
        const prettyName = osRelease.match(/PRETTY_NAME="(.+)"/);
        if (prettyName?.[1]) {
          return prettyName[1];
        }
      } catch {
        // Fallback if /etc/os-release doesn't exist or can't be read
      }
      return os.release();
    }
  } catch (error) {
    console.error('Error getting detailed OS info:', error);
    return os.release();
  }
}

/**
 * Executes a command and returns its trimmed output
 * @param {string} command Command to execute
 * @param {string} defaultValue Default value if command fails
 * @returns {string} Command output or default value
 */
function execCommand(command: string, defaultValue = ''): string {
  try {
    return cp.execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error executing command '${command}':`, error);
    return defaultValue;
  }
}

/**
 * Recursively searches for a package in dependencies tree
 * @param {Record<string, PackageInfo>} dependencies The dependencies object to search in
 * @param {string} packageName The name of the package to find
 * @returns {string | null} The package version or null if not found
 */
function findPackageInDependencies(
  dependencies: Record<string, PackageInfo> | undefined,
  packageName: string,
): string | null {
  // If no dependencies, return null
  if (!dependencies) return null;

  // Check if the package exists at the current level
  if (packageName in dependencies) {
    return dependencies[packageName]?.version ?? null;
  }

  // Recursively search in nested dependencies
  for (const dep of Object.values(dependencies)) {
    if (dep.dependencies) {
      const foundVersion = findPackageInDependencies(dep.dependencies, packageName);
      if (foundVersion) {
        return foundVersion;
      }
    }
  }

  return null;
}

/**
 * Gets the version of a Node.js package
 * @param {string} packageName The name of the package
 * @returns {string | null} The package version or null if not found
 */
function getPackageVersion(packageName: string): string | null {
  if (!packageName) return null;

  try {
    // First try to get from node_modules
    const packagePath = path.resolve(process.cwd(), 'node_modules', packageName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as PackageJson;
      return packageJson.version;
    }


    // Try using npm list as fallback with recursive search
    let output = null;
    try {
      output = execSync(`npm list --depth=10 --json`, { stdio: "pipe" }).toString();
      if (!output) return null;
    } catch (error) {
      return null;
    }

    try {
      const npmList = JSON.parse(output) as NpmListResult;

      // Try direct dependency
      const directVersion = npmList.dependencies?.[packageName]?.version;
      if (directVersion) return directVersion;

      // Try recursive search
      return findPackageInDependencies(npmList.dependencies, packageName);
    } catch (parseError) {
      console.error('Error parsing npm list output:', parseError);
      return null;
    }
  } catch (error) {
    console.error(`Error getting version for package ${packageName}:`, error);
    return null;
  }
}

/**
 * Returns minimal host data without slow operations (no npm list, no execSync for node/npm).
 * Use when reporter mode is "off" to avoid startup delay.
 * @returns {HostData} Minimal host information object
 */
export function getMinimalHostData(): HostData {
  return {
    system: os.platform(),
    machineName: os.hostname(),
    release: os.release(),
    version: '',
    arch: os.arch(),
    node: '',
    npm: '',
    framework: '',
    reporter: '',
    commons: '',
    apiClientV1: '',
    apiClientV2: '',
  };
}

/**
 * Gets information about the current host environment
 * @param {string} framework The framework name to check version for
 * @param {string} reporterName The reporter name to check version for
 * @returns {HostData} Host information object
 */
export function getHostInfo(framework: string, reporterName: string): HostData {
  try {
    return {
      system: process.platform,
      machineName: os.hostname(),
      release: os.release(),
      version: getDetailedOSInfo(),
      arch: os.arch(),
      node: execCommand('node --version'),
      npm: execCommand('npm --version'),
      framework: getPackageVersion(framework) ?? '',
      reporter: getPackageVersion(reporterName) ?? '',
      commons: getPackageVersion('qase-javascript-commons') ?? '',
      apiClientV1: getPackageVersion('qase-api-client') ?? '',
      apiClientV2: getPackageVersion('qase-api-v2-client') ?? '',
    };
  } catch (error) {
    return {
      system: process.platform,
      machineName: os.hostname() || '',
      release: os.release(),
      version: '',
      arch: os.arch(),
      node: '',
      npm: '',
      framework: '',
      reporter: '',
      commons: '',
      apiClientV1: '',
      apiClientV2: '',
    };
  }
}

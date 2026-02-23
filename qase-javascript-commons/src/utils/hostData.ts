import * as os from 'os';
import * as cp from 'child_process';
import * as fs from 'fs';
import { HostData } from '../models/host-data';
import { getPackageVersion } from './get-package-version';

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
 * Gets npm version from environment or by executing npm command
 * @returns {string} npm version string
 */
function getNpmVersion(): string {
  const userAgent = process.env['npm_config_user_agent'];
  if (userAgent) {
    const match = userAgent.match(/^npm\/(\S+)/);
    if (match?.[1]) {
      return match[1];
    }
  }

  try {
    return cp.execSync('npm --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return '';
  }
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
      node: process.version,
      npm: getNpmVersion(),
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

import { CommandArgs } from '@wdio/reporter';
import { getMimeTypes } from 'qase-javascript-commons';
import path from 'path';

/**
 * Check is object is empty
 * @param object {Object}
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmpty = (object: any) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  !object || Object.keys(object).length === 0;


export const isScreenshotCommand = (command: CommandArgs): boolean => {
  const isScreenshotEndpoint = /\/session\/[^/]*(\/element\/[^/]*)?\/screenshot/

  return (
    // WebDriver protocol
    (command.endpoint && isScreenshotEndpoint.test(command.endpoint)) ||
    // DevTools protocol
    command.command === 'takeScreenshot'
  )
}

const extensions: Record<string, string> = {
  'application/json': 'json',
  'application/pdf': 'pdf',
  'application/xml': 'xml',
  'application/zip': 'zip',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'text/csv': 'csv',
  'text/html': 'html',
  'text/plain': 'txt',
  'text/xml': 'xml',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

/**
 * Qase's v1 upload derives the MIME type from the file name only, so a name without
 * a known extension shows up as application/octet-stream.
 */
export const withExtension = (name: string, mimeType: string): string => {
  if (path.extname(name) && getMimeTypes(name) !== 'application/octet-stream') {
    return name;
  }
  const ext = extensions[mimeType.split(';')[0]?.trim().toLowerCase() ?? ''];
  return ext ? `${name}.${ext}` : name;
};

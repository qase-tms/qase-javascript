import * as path from 'path';
import * as mime from 'mime-types';

/**
 * Get mime type of the file
 * @param {string} filePath
 */
export function getMimeTypes(filePath: string): string {
  const fileName: string = path.basename(filePath);
  const mimeType: string | false = mime.contentType(fileName);
  if (!mimeType && typeof mimeType !== 'string') {
    return 'application/octet-stream';
  }
  return mimeType;
}

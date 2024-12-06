import * as fs from 'fs';
import * as path from 'path';

export class FileSearcher {
  /**
   * Finds all files in the given directory and its subdirectories
   * that were created after the specified time.
   *
   * @param folderPath Relative path to the folder.
   * @param time Time threshold as a Date object.
   * @returns Array of absolute paths to the matching files.
   */
  public static findFilesBeforeTime(folderPath: string, time: Date): string[] {
    const absolutePath = path.resolve(process.cwd(), folderPath);
    const result: string[] = [];

    const searchFiles = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          searchFiles(entryPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(entryPath);
          if (stats.birthtime > time) {
            result.push(entryPath);
          }
        }
      }
    };

    searchFiles(absolutePath);
    return result;
  }
}

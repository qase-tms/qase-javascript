import * as fs from 'fs';
import * as path from 'path';

export class FileSearcher {
  /**
   * Finds all files in the given directory and its subdirectories
   * that were created after the specified time.
   *
   * @param screenshotFolderPath Path to the folder with screenshots.
   * @param specFileName Name of the spec file.
   * @param time Time threshold as a Date object.
   * @returns Array of absolute paths to the matching files.
   */
  public static findFilesBeforeTime(screenshotFolderPath: string, specFileName: string, time: Date): string[] {
    const absolutePath = path.resolve(process.cwd(), screenshotFolderPath);
    const result: string[] = [];

    const paths = this.findFolderByName(absolutePath, specFileName);
    if (paths.length === 0) {
      return result;
    }

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

    for (const path of paths) {
      searchFiles(path);
    }

    return result;
  }

  private static findFolderByName(startPath: string, folderName: string): string[] {
    const result: string[] = [];

    function searchDirectory(currentPath: string): void {
      if (!fs.existsSync(currentPath)) {
        return;
      }

      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
          if (item.name === folderName) {
            result.push(itemPath);
          } else {
            searchDirectory(itemPath);
          }
        }
      }
    }

    searchDirectory(startPath);
    return result;
  }
}

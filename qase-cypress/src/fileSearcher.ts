import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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

  /**
   * Finds all mp4 video files in the given directory and its subdirectories
   * that were created after the specified time.
   *
   * @param videoFolderPath Path to the folder with video files.
   * @param specFileName Name of the spec file (without extension).
   * @param time Time threshold as a Date object.
   * @returns Array of absolute paths to the matching mp4 files.
   */
  public static findVideoFilesBeforeTime(videoFolderPath: string, specFileName: string, time: Date): string[] {
    const absolutePath = path.resolve(process.cwd(), videoFolderPath);
    const result: string[] = [];

    const paths = this.findFolderByName(absolutePath, specFileName);
    if (paths.length === 0) {
      return result;
    }

    const searchVideoFiles = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          searchVideoFiles(entryPath);
        } else if (entry.isFile()) {
          // Check if the file is an mp4 video file
          if (entry.name.toLowerCase().endsWith('.mp4')) {
            const stats = fs.statSync(entryPath);
            if (stats.birthtime > time) {
              result.push(entryPath);
            }
          }
        }
      }
    };

    for (const path of paths) {
      searchVideoFiles(path);
    }

    return result;
  }

  /**
   * Finds all mp4 video files in the given directory and its subdirectories.
   *
   * @param videoFolderPath Path to the folder with video files.
   * @param specFileName Name of the spec file (without extension).
   * @param specRelativePath Optional relative path from e2e directory to the spec file.
   * @returns Array of absolute paths to the matching mp4 files.
   */
  public static findVideoFiles(videoFolderPath: string, specFileName: string, specRelativePath?: string): string[] {
    const absolutePath = path.resolve(process.cwd(), videoFolderPath);
    const result: string[] = [];

    if (!fs.existsSync(absolutePath)) {
      return result;
    }

    // Recursively search for video files in all subdirectories
    const findVideoFilesRecursively = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile()) {
          const fileName = entry.name;
          // Check if the file is an mp4 video file with the expected format: {specFileName}.cy.js.mp4
          if (fileName.toLowerCase().endsWith('.mp4') && fileName.startsWith(specFileName)) {
            const entryPath = path.join(dir, fileName);
            result.push(entryPath);
          }
        } else if (entry.isDirectory()) {
          const subDirPath = path.join(dir, entry.name);
          findVideoFilesRecursively(subDirPath);
        }
      }
    };

    // If we have a relative path, prioritize the corresponding subdirectory
    if (specRelativePath) {
      const specDir = path.dirname(specRelativePath);
      
      // Only process if specDir is not the current directory ('.')
      if (specDir !== '.') {
        const videoSubDir = path.join(absolutePath, specDir);
        
        if (fs.existsSync(videoSubDir)) {
          findVideoFilesRecursively(videoSubDir);
        }
      }
    }

    // If we didn't find files in the expected subdirectory, search the entire videos directory
    if (result.length === 0) {
      findVideoFilesRecursively(absolutePath);
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

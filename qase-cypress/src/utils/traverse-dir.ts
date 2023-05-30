import { readdirSync } from "fs";
import path from "path";

// TODO: get rid of recursion
export const traverseDir = (
  dirPath: string,
  callback: (filePath: string) => void,
) => {
  const items = readdirSync(dirPath, { withFileTypes: true });

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item.name);

    if (item.isFile()) {
      callback(itemPath);
    } else if (item.isDirectory()) {
      try {
        traverseDir(itemPath, callback);
      } catch (error) {/* ignore */}
    }
  });
}

import { readFileSync } from 'fs';

export const getPackageVersion = (name: string) => {
    try {
        const pathToPackageJson = require.resolve(`${name}/package.json`, {
            paths: [process.cwd()],
        });

        const packageString = readFileSync(pathToPackageJson, 'utf8');
        const packageObject: unknown = JSON.parse(packageString);

        if (typeof packageObject === 'object' && packageObject && ('version' in packageObject)) {
            return String(packageObject.version);
        }
    } catch {/* ignore */}

    return undefined;
}

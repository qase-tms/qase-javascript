module.exports = {
    globals: {},
    reporters: [
        'default',
        [
            'jest-qase-reporter',
            {
                // apiToken: "261b7509136f80ced8a00fa9aa6dabf405d9005e",
                // basePath: "https://api.stage.qase.io/v1",
                // apiToken: "91d707dd326c1e74f967c7132417ae17d91b616f",
                // basePath: "https://api.qase.io/v1",
                // projectCode: 'JTP',
                // runId: 68,
                // apiToken: "150f9d48bee1d527bfd6da461e504066b44cc63a",
                // basePath: "http://api.qase.lo/v1",
                basePath: "https://api.qdev-2474.feature.qase.io/v1",
                apiToken: "596c258a2d2e6c079fa8aee5a2aa31697e7d2969",
                projectCode: 'JRC',
                runComplete: true,
                logging: true,
            },
        ],
    ],
    roots: [
        '<rootDir>/test',
    ],
    testMatch: [
        '**/__tests__/**/*.js?(x)',
        '**/?(*.)+(spec|test).js?(x)',
        '**/__tests__/**/*.ts?(x)',
        '**/?(*.)+(spec|test).ts?(x)',
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    testEnvironment: 'node',
};

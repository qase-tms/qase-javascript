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
                // apiToken: "fcea1e45272a79a2f75b9b011592a77ac37e1e8a",
                // basePath: "http://api.qase.lo/v1",
                apiToken: "2724455eeffd7a3859be00356f1c10d40313f3c0",
                basePath: "https://api.qdev-2474.feature.qase.io/v1",
                projectCode: 'JRC5',
                runComplete: false,
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

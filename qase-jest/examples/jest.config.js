module.exports = {
    globals: {},
    reporters: [
        'default',
        [
            'jest-qase-reporter',
            {
                projectCode: 'JRQ',
                basePath: 'http://api.stage.qase.io/v1',
                apiToken: 'ad9d48cf206a9ded204a4ff9cb7bf93dc5113305',
                // projectCode: 'JTC',
                // basePath: 'http://api.qase.lo/v1',
                // apiToken: 'dev_owner_api_token',
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

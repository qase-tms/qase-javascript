module.exports = {
    globals: {},
    reporters: [
        'default',
        [
            'jest-qase-reporter',
            {
                apiToken: 'api_key',
                projectCode: 'project_code',
                logging: true,
                runComplete: true,
                rootSuiteTitle: 'Jest tests',
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

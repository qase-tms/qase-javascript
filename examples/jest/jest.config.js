module.exports = {
    globals: {},
    transform: {
        "^.+\\.(js|jsx)$": "babel-jest",
    },
    reporters: [
        'default',
        ['jest-qase-reporter', {
            logging: true,

            testops: {
                apiToken: 'api_key',
                projectCode: 'project_code',
                baseUrl: 'https://qase.io',
                uploadAttachments: true,
                runComplete: true,
                environmentId: 1,
            },

            report: {
                path: './qase/reports',
            },
        }],
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

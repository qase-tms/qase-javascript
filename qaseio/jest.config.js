/* eslint-disable */
module.exports = {
    preset: 'ts-jest',
    // roots: ['<rootDir>/test'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['js', 'ts'],
    moduleNameMapper: {
        '^@qaseio$': '<rootDir>/src/index.ts',
    },
    collectCoverage: true,
    coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
    testEnvironment: 'node',
};

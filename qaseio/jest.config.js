/* eslint-disable */
module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        skipLibCheck: true,
      },
    }],
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)'
  ],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['js', 'ts'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],
  testEnvironment: 'node',
};

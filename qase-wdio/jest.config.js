module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^qase-javascript-commons$': '<rootDir>/../qase-javascript-commons/src/index.ts',
  },
  setupFilesAfterEnv: [],
  testTimeout: 10000,
}; 

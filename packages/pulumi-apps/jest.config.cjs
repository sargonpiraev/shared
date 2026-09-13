/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          moduleResolution: 'Bundler',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/__tests__/**/*.ts',
    '!src/webapp/webapp.ts',
    '!src/webapp/report-sql.ts',
  ],
  coverageDirectory: 'coverage',
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'cobertura'],
  testMatch: ['**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/src/webapp/report-fn/',
    '<rootDir>/build/webapp/report-fn/',
  ],
}

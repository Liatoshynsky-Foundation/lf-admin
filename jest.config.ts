import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './'
});

const config: Config = {
  bail: 1,
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.{test,d}.{js,jsx,ts,tsx}',
    '!app/layout.tsx',
    '!app/types/**',
    'src/**/*.{js,ts}',
    '!src/**/*.{test,d}.{js,ts}',
    '!src/interfaces/**/*.{js,ts,graphql}',
    '!src/domain/**/*.{js,ts}',
    '!src/constants/**/*.{js,ts}',
    '!src/infrastructure/models/**/*.{js,ts}'
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  modulePaths: ['<rootDir>/app'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/coverage/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(lodash-es)/)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom']
};

export default createJestConfig(config);

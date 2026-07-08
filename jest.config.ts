import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './'
});
const isCI = !!process.env.CI;

const config: Config = {
  bail: 1,
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.{test,d}.{js,jsx,ts,tsx}',
    '!app/**/*.stories.{js,jsx,ts,tsx}',
    '!app/layout.tsx',
    '!app/types/**',
    'src/**/*.{js,ts}',
    '!src/**/*.{test,d}.{js,ts}',
    '!src/interfaces/graphql/schemas/*.{graphql}',
    '!src/interfaces/graphql/**/index.ts',
    '!src/container/**/*.{js,ts}',
    '!src/domain/**/*.{js,ts}',
    '!src/constants/**/*.{js,ts}',
    '!src/shared/types/**/*.{js,ts}',
    '!src/infrastructure/models/**/*.{js,ts}',
    '!src/validators/**/*.{js,ts}'
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: isCI ? ['text', 'lcov'] : ['text'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^~/back-config$': '<rootDir>/src/back-config',
    '^~/uploads/(.*)$': '<rootDir>/src/uploads/$1',
    '^lodash-es$': 'lodash',
    '^~/public/(.*)$': '<rootDir>/public/$1',
    '^~/utils/(.*)$': '<rootDir>/app/lib/utils/$1',
    '^~/ds-components/(.*)$': '<rootDir>/app/shared/components/design-system/$1',
    '^~/components/(.*)$': '<rootDir>/app/shared/components/$1',
    '^~/hooks/(.*)$': '<rootDir>/app/shared/hooks/$1',
    '^~/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^~/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^~/types/(.*)$': '<rootDir>/app/types/$1',
    '^~/src/(.*)$': '<rootDir>/src/$1',
    '^~/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^~/(.*)$': '<rootDir>/app/$1'
  },
  modulePaths: ['<rootDir>/app', '<rootDir>/src'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/coverage/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', { useESM: true }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mongoose|mongodb|bson|lodash-es|@azure|@blocknote|uuid|@aws-sdk|@smithy)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 15000,
  detectOpenHandles: isCI,
  forceExit: true,
  maxWorkers: isCI ? 2 : '50%'
};

export default createJestConfig(config);

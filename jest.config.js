module.exports = {
  projects: [
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/apps/frontend/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/apps/frontend/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/frontend/$1',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
      },
      collectCoverageFrom: [
        'apps/frontend/**/*.{js,jsx,ts,tsx}',
        '!apps/frontend/**/*.d.ts',
        '!apps/frontend/node_modules/**',
        '!apps/frontend/.next/**',
      ],
    },
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/apps/backend/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/apps/backend/tsconfig.json',
        },
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/backend/src/$1',
      },
      collectCoverageFrom: [
        'apps/backend/src/**/*.{js,ts}',
        '!apps/backend/src/**/*.d.ts',
        '!apps/backend/node_modules/**',
      ],
    },
    {
      displayName: 'backend-e2e',
      testMatch: ['<rootDir>/apps/backend/test/**/*.e2e-spec.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/apps/backend/tsconfig.json',
        },
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/backend/src/$1',
      },
    },
    {
      displayName: 'shared-types',
      testMatch: ['<rootDir>/packages/shared-types/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
      },
    },
    {
      displayName: 'shared-utils',
      testMatch: ['<rootDir>/packages/shared-utils/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
      },
    }
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
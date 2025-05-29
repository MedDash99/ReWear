// jest.config.js
const nextJest = require('next/jest')();

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: for global setup
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add more Jest options here if needed
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

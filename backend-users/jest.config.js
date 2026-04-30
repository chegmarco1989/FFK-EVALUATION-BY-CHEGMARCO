/**
 * =============================================================================
 * JEST CONFIGURATION - TESTING SETUP
 * =============================================================================
 * This configuration enables TypeScript support in Jest and sets up
 * comprehensive test coverage reporting.
 */

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Run tests in Node.js environment (not browser)
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // Test file patterns - Jest will run files matching these patterns
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Module path aliases - must match tsconfig.json paths
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // Coverage configuration - tracks which code is tested
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/index.ts', // Entry point doesn't need coverage
  ],
  
  // Coverage thresholds - tests fail if coverage drops below these values
  // This ensures we maintain high code quality
  coverageThreshold: {
    global: {
      branches: 80,    // 80% of conditional branches must be tested
      functions: 80,   // 80% of functions must be tested
      lines: 80,       // 80% of lines must be executed in tests
      statements: 80   // 80% of statements must be executed
    }
  },
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters - generate multiple formats for different tools
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Timeout for tests (10 seconds)
  testTimeout: 10000,
  
  // Clear mocks between tests to prevent test pollution
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
};

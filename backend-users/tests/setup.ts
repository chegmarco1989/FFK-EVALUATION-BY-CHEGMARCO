/**
 * =============================================================================
 * TEST SETUP
 * =============================================================================
 * Global setup for Jest tests.
 * Runs before all tests.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-min-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '9091';
process.env.LOG_LEVEL = 'error'; // Reduce noise in test output

// Increase test timeout for database operations
jest.setTimeout(10000);

/**
 * Jest setup file - runs before each test file
 * Configures environment variables and global test utilities
 */
require('dotenv').config({ path: '.env.test' });

// Increase timeout for integration tests with database operations
jest.setTimeout(30000);

// Mock console.log to reduce noise in test output (optional)
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  debug: jest.fn(), // Mock console.debug
  // Keep error and warn for debugging
};

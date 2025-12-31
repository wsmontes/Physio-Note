module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/fixtures/',
    '/__tests__/test-app.js'
  ],
};

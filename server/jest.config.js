module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

const {TestEnvironment} = require('jest-environment-node');

class CustomTestEnvironment extends TestEnvironment {
  constructor(config, context) {
    // Pass storageQuota: 0 to disable localStorage initialization
    super({
      ...config,
      testEnvironmentOptions: {
        ...config.testEnvironmentOptions,
        storageQuota: 0,
      },
    }, context);
  }

  async setup() {
    await super.setup();
    
    // Mock localStorage if it doesn't exist
    if (typeof this.global.localStorage === 'undefined') {
      this.global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      };
    }
  }

  async teardown() {
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = CustomTestEnvironment;

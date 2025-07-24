const NodeEnvironment = require('jest-environment-node').default;

class TestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    
    // Set test environment variables
    this.global.process.env.NODE_ENV = 'test';
    this.global.process.env.JWT_SECRET = 'test-jwt-secret';
    this.global.process.env.REDIS_URL = 'redis://localhost:6379';
    
    // Mock console methods to reduce noise
    this.global.console.log = jest.fn();
    this.global.console.error = jest.fn();
    this.global.console.warn = jest.fn();
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = TestEnvironment;
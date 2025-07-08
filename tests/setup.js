// Jest setup file
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Setup before all tests
beforeAll(async () => {
    // Use in-memory MongoDB for tests
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_TEST_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.NODE_ENV = 'test';
});

// Cleanup after all tests
afterAll(async () => {
    if (mongod) {
        await mongod.stop();
    }
});

// Increase timeout for database operations
jest.setTimeout(30000);

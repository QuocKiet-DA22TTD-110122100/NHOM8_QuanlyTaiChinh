// Mock Redis trước khi import bất kỳ module nào
jest.mock('redis', () => {
    const mockRedisClient = {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        setEx: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        exists: jest.fn().mockResolvedValue(0),
        expire: jest.fn().mockResolvedValue(1),
        on: jest.fn(),
        isConnected: true
    };

    return {
        createClient: jest.fn(() => mockRedisClient)
    };
});

// Mock mongoose
jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue({}),
    connection: {
        readyState: 1,
        close: jest.fn(),
        on: jest.fn()
    },
    Schema: jest.fn().mockImplementation(() => ({})),
    model: jest.fn()
}));

// Mock models trực tiếp thay vì require
jest.mock('../models/User', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn()
}));

jest.mock('../models/Transaction', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn()
}));

jest.mock('../models/Category', () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn()
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ userId: 'mock-user-id' }))
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true)
}));

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/testdb';
process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

console.log('Test environment setup completed');



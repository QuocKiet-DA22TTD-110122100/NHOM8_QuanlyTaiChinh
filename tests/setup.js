const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  add: jest.fn()
}));

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    add: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    simple: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt')
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 'mock-user-id' }))
}));

// Setup before all tests với timeout dài hơn
beforeAll(async () => {
    try {
        console.log('Starting MongoDB Memory Server...');
        
        // Tạo MongoMemoryServer với config tối ưu
        mongod = new MongoMemoryServer({
            binary: {
                version: '4.4.18', // Sử dụng version cũ hơn, nhẹ hơn
                downloadDir: './mongodb-binaries',
                platform: 'win32',
                arch: 'x64'
            },
            instance: {
                port: 27017,
                dbName: 'testdb'
            },
            autoStart: false
        });

        await mongod.start();
        
        const uri = mongod.getUri();
        process.env.MONGO_URI = uri;
        process.env.MONGODB_TEST_URI = uri;
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.NODE_ENV = 'test';
        process.env.REDIS_URL = 'redis://localhost:6379';
        
        console.log('Test database started:', uri);
    } catch (error) {
        console.error('Failed to start test database:', error);
        // Fallback: sử dụng mock URI nếu không thể khởi tạo MongoDB
        process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
        process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/testdb';
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.NODE_ENV = 'test';
        process.env.REDIS_URL = 'redis://localhost:6379';
    }
}, 60000); // Tăng timeout lên 60 giây

afterAll(async () => {
    try {
        if (mongod) {
            await mongod.stop();
            console.log('Test database stopped');
        }
    } catch (error) {
        console.error('Failed to stop test database:', error);
    }
}, 30000);

jest.setTimeout(60000); // Tăng timeout cho tất cả tests

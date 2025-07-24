// Mock Redis client
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

const mockRedis = {
    createClient: jest.fn().mockImplementation(() => {
        console.log('createClient called, returning:', mockRedisClient);
        return mockRedisClient;
    })
};

module.exports = mockRedis;


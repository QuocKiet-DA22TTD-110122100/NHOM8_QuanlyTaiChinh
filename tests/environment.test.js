describe('Test Environment', () => {
    test('Environment variables are set', () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(process.env.JWT_SECRET).toBeDefined();
        expect(process.env.MONGODB_TEST_URI).toBeDefined();
    });

    test('Redis mock is working', () => {
        const redis = require('redis');
        const client = redis.createClient();
        
        expect(client).toBeDefined();
        expect(typeof client.get).toBe('function');
        expect(typeof client.set).toBe('function');
    });

    test('Basic math operations', () => {
        expect(1 + 1).toBe(2);
        expect(2 * 3).toBe(6);
    });
});